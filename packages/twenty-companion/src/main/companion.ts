import { SettingsRecoveryError } from './secure-store';
import { app, shell, Notification, nativeTheme } from 'electron';
import {
  agendaSchema,
  type Settings,
  type CompanionCommand,
  type CompanionState,
} from '../shared/types';
import {
  getDueMeetings,
  getMeetingUrl,
  getMeetingOccurrenceKey,
} from '../shared/meetings';
import { createInitialState } from '../shared/create-initial-state';
import {
  connectOAuth,
  getDesktopInstallationUrl,
  DesktopRecorderUnavailableError,
} from './oauth';
import { SecureStore } from './secure-store';
import { TwentyClient } from './twenty-client';
import { RecordingController } from './recording-controller';

export class Companion {
  state = createInitialState();
  private store = new SecureStore(app.getPath('userData'));
  private client = new TwentyClient(this.store);
  private handledIds = new Set<string>();
  private refreshing = false;
  private connectionVersion = 0;
  private changingConnection = false;
  private connectionAbort: AbortController | null = null;
  private stopped = false;
  private settingsUpdate: Promise<void> = Promise.resolve();
  private syncingTimer?: NodeJS.Timeout;
  private joiningTimer?: NodeJS.Timeout;
  private recording = new RecordingController(this.state, this.client, {
    emit: () => this.emit(),
    openApp: () => this.openApp(),
    notify: (title, body) => this.notify(title, body),
    fail: (error) => this.fail(error),
    refresh: () => this.refresh(),
    canRecord: () => !this.stopped && !this.changingConnection,
    isStopping: () => this.stopped,
  });

  constructor(
    private publish: (state: CompanionState) => void,
    private openApp: () => void = () => undefined,
    private registerOpenShortcut: (shortcut: string) => void = () => undefined,
  ) {}

  async initialize(): Promise<void> {
    if (this.recording.listening) return;
    this.stopped = false;
    this.recording.listenToRecording();
    let settingsError: unknown;
    try {
      this.state.settings = await this.store.readSettings();
    } catch (error) {
      if (error instanceof SettingsRecoveryError)
        this.state.settings = error.settings;
      else
        this.state.settings = {
          ...this.state.settings,
          autoJoin: false,
          autoRecord: false,
        };
      settingsError = error;
    }
    try {
      this.registerOpenShortcut(this.state.settings.openShortcut);
    } catch (error) {
      this.fail(error);
    }
    nativeTheme.themeSource = this.state.settings.appearance;
    this.handledIds = new Set(await this.store.readHandledMeetings());
    try {
      const credentials = await this.client.restore();
      if (credentials) {
        this.state.serverUrl = credentials.serverUrl;
        this.state.connection = 'connected';
        await this.refresh();
        await this.recording.initializeSdk();
      }
    } catch (error) {
      this.fail(error);
    }
    if (settingsError) this.fail(settingsError);
    if (!this.stopped) this.startTimers();
    this.emit();
  }

  private startTimers(): void {
    this.syncingTimer = setInterval(
      () => void this.refresh().catch((error) => this.fail(error)),
      30_000,
    );
    this.joiningTimer = setInterval(
      () => void this.tick().catch((error) => this.fail(error)),
      1000,
    );
    this.emit();
  }

  async command(command: CompanionCommand): Promise<void> {
    if (this.stopped) return;
    try {
      this.state.error = null;
      switch (command.type) {
        case 'cancel-connect':
          this.connectionAbort?.abort();
          break;
        case 'connect': {
          if (this.changingConnection || this.recording.isRecording) return;
          this.changingConnection = true;
          const previousConnection = this.state.connection;
          const connectionAbort = new AbortController();
          this.connectionAbort = connectionAbort;
          try {
            this.state.connection = 'connecting';
            this.emit();
            const credentials = await connectOAuth(
              command.serverUrl,
              (url) => shell.openExternal(url),
              connectionAbort.signal,
            );
            connectionAbort.signal.throwIfAborted();
            if (this.stopped) return;
            this.openApp();
            if (process.platform === 'darwin') app.focus({ steal: true });
            await this.client.connect(credentials, connectionAbort.signal);
            this.connectionVersion++;
            this.refreshing = false;
            await this.recording.resetSdk();
            if (this.stopped) return;
            this.resetWorkspaceState();
            this.state.serverUrl = credentials.serverUrl;
            this.state.connection = 'connected';
            await this.refresh();
            await this.recording.initializeSdk();
          } catch (error) {
            if (this.state.connection === 'connecting')
              this.state.connection = previousConnection;
            if (!connectionAbort.signal.aborted) throw error;
          } finally {
            this.connectionAbort = null;
            this.changingConnection = false;
          }
          break;
        }
        case 'disconnect': {
          if (this.recording.isRecording || this.changingConnection)
            throw new Error(
              'Stop the recording before disconnecting your workspace.',
            );
          this.connectionVersion++;
          this.changingConnection = true;
          this.resetWorkspaceState();
          this.refreshing = false;
          try {
            await this.client.disconnect();
            await this.recording.resetSdk();
            await this.store.writeHandledMeetings([]);
          } finally {
            this.changingConnection = false;
          }
          break;
        }
        case 'settings':
          await this.updateSettings(command.settings);
          break;
        case 'begin-permission-setup':
          if (this.state.activeRecording) return;
          this.state.permissionSetup = {};
          await this.recording.initializeSdk();
          this.recording.refreshPermissions();
          this.openApp();
          break;
        case 'complete-setup':
          this.recording.refreshPermissions();
          if (
            !Object.values(this.state.permissions).every(
              (status) => status === 'granted',
            )
          )
            throw new Error(
              'Enable microphone, system audio, and meeting detection to continue.',
            );
          await this.updateSettings({ setupCompleted: true });
          this.state.permissionSetup = null;
          break;
        case 'permission':
          await this.recording.requestPermission(command.permission);
          break;
        case 'cancel-permission-setup':
          this.state.permissionSetup = null;
          break;
        case 'refresh':
          await this.refresh();
          break;
        case 'skip':
          await this.markHandled(command.meetingId);
          break;
        case 'unskip': {
          const meeting = this.state.meetings.find(
            (item) => item.id === command.meetingId,
          );
          if (!meeting) throw new Error('This meeting is no longer available.');
          this.handledIds.delete(getMeetingOccurrenceKey(meeting));
          this.state.skippedMeetingIds = this.state.skippedMeetingIds.filter(
            (id) => id !== meeting.id,
          );
          await this.store.writeHandledMeetings([...this.handledIds]);
          break;
        }
        case 'join':
          await this.join(command.meetingId);
          break;
        case 'record':
          await this.recording.record(command.windowId);
          break;
        case 'stop':
          await this.recording.stopRecording();
          break;
        case 'pause':
        case 'resume':
          await this.recording.pause(command.type === 'pause');
          break;
        case 'open-recording':
          if (
            !this.state.recordings.some(
              (recording) => recording.id === command.recordingId,
            )
          )
            throw new Error('Recording is unavailable. Refresh and try again.');
          await shell.openExternal(
            `${this.client.workspaceUrl ?? this.state.serverUrl}/object/callRecording/${command.recordingId}`,
          );
          break;
        case 'open-calendar-settings':
          await shell.openExternal(
            `${this.client.workspaceUrl ?? this.state.serverUrl}/settings/accounts`,
          );
          break;
        case 'open-desktop-setup':
          await shell.openExternal(
            await getDesktopInstallationUrl(command.serverUrl),
          );
          break;
        case 'open-desktop-installation':
          await shell.openExternal(
            await getDesktopInstallationUrl(command.serverUrl),
          );
          break;
        case 'dismiss-error':
          this.state.notice = null;
          break;
      }
    } catch (error) {
      if (this.state.connection === 'connecting')
        this.state.connection = 'disconnected';
      this.fail(error);
    } finally {
      this.emit();
    }
  }

  private resetWorkspaceState(): void {
    Object.assign(this.state, {
      connection: 'disconnected',
      workspace: null,
      meetings: [],
      recordings: [],
      calendarConnected: false,
      updatedAt: null,
      detectedCalls: [],
      permissionSetup: null,
      skippedMeetingIds: [],
      notice: null,
    });
    this.handledIds.clear();
    this.recording.resetWorkspace();
  }

  private updateSettings(patch: Partial<Settings>): Promise<void> {
    const update = this.settingsUpdate.then(async () => {
      const settings = { ...this.state.settings, ...patch };
      const shortcutChanged =
        settings.openShortcut !== this.state.settings.openShortcut;
      if (shortcutChanged) this.registerOpenShortcut(settings.openShortcut);
      try {
        await this.store.writeSettings(settings);
      } catch (error) {
        if (shortcutChanged)
          this.registerOpenShortcut(this.state.settings.openShortcut);
        throw error;
      }
      if (settings.launchAtLogin !== this.state.settings.launchAtLogin)
        app.setLoginItemSettings({
          openAtLogin: settings.launchAtLogin,
          args: ['--background'],
        });
      this.state.settings = settings;
      nativeTheme.themeSource = settings.appearance;
    });
    this.settingsUpdate = update.catch(() => undefined);
    return update;
  }

  async refresh(): Promise<void> {
    if (
      this.stopped ||
      this.state.connection !== 'connected' ||
      this.refreshing
    )
      return;
    this.refreshing = true;
    const connectionVersion = this.connectionVersion;
    try {
      const agenda = await this.client.companion(
        { action: 'agenda' },
        agendaSchema,
      );
      if (
        this.state.connection !== 'connected' ||
        connectionVersion !== this.connectionVersion
      )
        return;
      this.state.workspace = agenda.workspace;
      if (this.client.workspace?.id === agenda.workspace.id)
        this.state.workspace.logoUrl = this.client.workspace.logoUrl;
      this.state.meetings = agenda.meetings;
      this.state.skippedMeetingIds = agenda.meetings
        .filter((meeting) =>
          this.handledIds.has(getMeetingOccurrenceKey(meeting)),
        )
        .map((meeting) => meeting.id);
      // Completion webhooks can lag behind the local recording-ended event.
      const finishing = this.state.recordings.filter(
        (recording) =>
          recording.status === 'PROCESSING' &&
          recording.endedAt &&
          Date.now() - Date.parse(recording.endedAt) < 120_000 &&
          !agenda.recordings.some(
            (remote) =>
              remote.id === recording.id &&
              ['COMPLETED', 'FAILED'].includes(remote.status),
          ),
      );
      this.state.recordings = [
        ...finishing,
        ...agenda.recordings.filter(
          (recording) => !finishing.some((local) => local.id === recording.id),
        ),
      ];
      this.state.recordings = this.state.recordings.map((recording) => ({
        ...recording,
        participants: recording.participants?.map((participant) => ({
          ...participant,
          avatarUrl: this.client.resolveImageUrl(participant.avatarUrl),
        })),
      }));
      this.state.calendarConnected = agenda.calendarConnected;
      this.state.updatedAt = new Date().toISOString();
      this.state.error = null;
    } catch (error) {
      if (connectionVersion === this.connectionVersion && this.client.workspace)
        this.state.workspace = this.client.workspace;
      throw error;
    } finally {
      if (connectionVersion === this.connectionVersion) this.refreshing = false;
      this.emit();
    }
  }

  private async tick(): Promise<void> {
    if (this.state.permissionSetup || !this.state.settings.setupCompleted)
      this.recording.refreshPermissions();
    if (
      this.state.connection !== 'connected' ||
      this.stopped ||
      !this.state.settings.setupCompleted ||
      !this.state.settings.autoJoin ||
      !this.state.updatedAt
    )
      return;
    const due = getDueMeetings({
      meetings: this.state.meetings,
      handledIds: this.handledIds,
      now: Date.now(),
      lastSyncedAt: Date.parse(this.state.updatedAt),
    });
    for (const meeting of due) {
      if (
        this.recording.isRecording ||
        this.state.detectedCalls.length > 0 ||
        due.length > 1
      ) {
        await this.markHandled(meeting.id);
        this.notify(
          'Your next meeting is starting',
          `${meeting.title}. Open Twenty to join when you are ready.`,
        );
      } else {
        await this.join(meeting.id);
      }
    }
  }

  private async join(meetingId: string): Promise<void> {
    const meeting = this.state.meetings.find((item) => item.id === meetingId);
    if (!meeting?.url) throw new Error('This meeting has no join link.');
    const connectionVersion = this.connectionVersion;
    const url = getMeetingUrl(meeting.url);
    await this.markHandled(meeting.id);
    if (
      this.stopped ||
      this.state.connection !== 'connected' ||
      connectionVersion !== this.connectionVersion
    )
      return;
    await shell.openExternal(url);
    this.state.notice = { type: 'opening-meeting', title: meeting.title };
  }

  private async markHandled(id: string): Promise<void> {
    const meeting = this.state.meetings.find((item) => item.id === id);
    if (!meeting) throw new Error('This meeting is no longer available.');
    const key = getMeetingOccurrenceKey(meeting);
    if (this.handledIds.has(key)) return;
    this.handledIds.add(key);
    this.state.skippedMeetingIds = [
      ...new Set([...this.state.skippedMeetingIds, id]),
    ];
    await this.store.writeHandledMeetings([...this.handledIds]);
  }

  private notify(title: string, body: string): void {
    if (Notification.isSupported()) {
      const notification = new Notification({ title, body });
      notification.on('click', this.openApp);
      notification.show();
    }
  }

  private fail(error: unknown): void {
    this.state.error = {
      message:
        error instanceof Error
          ? error.message
          : 'Something went wrong. Please try again.',
      ...(error instanceof DesktopRecorderUnavailableError
        ? {
            recovery: {
              type: 'open-desktop-installation' as const,
              serverUrl: error.serverUrl,
            },
          }
        : {}),
    };
    this.emit();
  }

  private emit(): void {
    this.publish(structuredClone(this.state));
  }

  get isRecording(): boolean {
    return this.recording.isRecording;
  }

  refreshPermissions(): void {
    this.recording.refreshPermissions();
  }

  async shutdown(): Promise<void> {
    this.stopped = true;
    this.connectionVersion++;
    clearInterval(this.syncingTimer);
    clearInterval(this.joiningTimer);
    try {
      await this.recording.shutdown();
      await this.settingsUpdate;
    } catch (error) {
      this.stopped = false;
      this.startTimers();
      throw error;
    }
    this.recording.dispose();
  }
}
