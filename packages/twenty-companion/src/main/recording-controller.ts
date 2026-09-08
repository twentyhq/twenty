import { randomUUID } from 'node:crypto';
import { shell, systemPreferences } from 'electron';
import RecallAiSdk, {
  type RecallAiSdkWindow,
  type EventTypeToPayloadMap,
} from '@recallai/desktop-sdk';
import {
  recordingUploadSchema,
  recordingConfigurationSchema,
  recordingResultSchema,
  type CompanionState,
} from '../shared/types';
import { matchMeeting } from '../shared/meetings';
import { type TwentyClient } from './twenty-client';

const RECALL_REGIONS = new Set([
  'https://eu-central-1.recall.ai',
  'https://us-east-1.recall.ai',
  'https://us-west-2.recall.ai',
  'https://ap-northeast-1.recall.ai',
]);

type RecordingEvents = {
  emit: () => void;
  openApp: () => void;
  notify: (title: string, body: string) => void;
  fail: (error: unknown) => void;
  refresh: () => Promise<void>;
  canRecord: () => boolean;
  isStopping: () => boolean;
};

export class RecordingController {
  private sdkRegion: string | null = null;
  private sdkInitialization: Promise<void> | null = null;
  private autoHandledWindows = new Set<string>();
  private interruptedByNetwork = false;
  private networkConnected = true;
  private recordingPause: Promise<void> | null = null;
  private recordingStop: Promise<void> | null = null;
  private recordingStart: Promise<void> | null = null;
  private unsubscribeRecording: (() => void)[] = [];

  constructor(
    private state: CompanionState,
    private client: TwentyClient,
    private events: RecordingEvents,
  ) {}

  get isRecording(): boolean {
    return !!this.state.activeRecording || !!this.recordingStart;
  }

  get listening(): boolean {
    return this.unsubscribeRecording.length > 0;
  }

  async resetSdk(): Promise<void> {
    await this.sdkInitialization;
    await this.stopSdk();
  }

  resetWorkspace(): void {
    this.autoHandledWindows.clear();
  }

  async shutdown(): Promise<void> {
    await this.recordingStart?.catch(() => undefined);
    await this.sdkInitialization?.catch(() => undefined);
    await this.stopRecording();
    await this.stopSdk();
  }

  dispose(): void {
    this.unsubscribeRecording.forEach((unsubscribe) => unsubscribe());
    this.unsubscribeRecording = [];
  }

  async pause(pausing: boolean): Promise<void> {
    if (this.recordingPause) return;
    this.recordingPause = this.changeRecordingPause(pausing).finally(() => {
      this.recordingPause = null;
    });
    await this.recordingPause;
  }

  private async changeRecordingPause(pausing: boolean): Promise<void> {
    const recording = this.state.activeRecording;

    if (
      this.recordingStop ||
      !recording ||
      recording.status !== (pausing ? 'recording' : 'paused')
    )
      return;
    recording.status = pausing ? 'pausing' : 'resuming';
    this.events.emit();
    try {
      if (pausing)
        await RecallAiSdk.pauseRecording({
          windowId: recording.windowId,
        });
      else
        await RecallAiSdk.resumeRecording({
          windowId: recording.windowId,
        });
      if (
        this.state.activeRecording !== recording ||
        recording.status !== (pausing ? 'pausing' : 'resuming')
      )
        return;
      if (pausing) recording.pausedAt = new Date().toISOString();
      else {
        recording.pausedMilliseconds =
          (recording.pausedMilliseconds ?? 0) +
          (recording.pausedAt
            ? Date.now() - Date.parse(recording.pausedAt)
            : 0);
        recording.pausedAt = undefined;
      }
      recording.status = pausing ? 'paused' : 'recording';
    } catch (error) {
      if (
        this.state.activeRecording === recording &&
        recording.status === (pausing ? 'pausing' : 'resuming')
      )
        recording.status = pausing ? 'recording' : 'paused';
      throw error;
    }
  }

  stopRecording(): Promise<void> {
    this.recordingStop ??= this.finishCapture().finally(() => {
      this.recordingStop = null;
    });
    return this.recordingStop;
  }

  private async finishCapture(): Promise<void> {
    await this.recordingStart?.catch(() => undefined);
    await this.recordingPause?.catch(() => undefined);
    const recording = this.state.activeRecording;
    if (!recording) return;
    const previousStatus = recording.status;
    recording.status = 'stopping';
    this.events.emit();
    try {
      await RecallAiSdk.stopRecording({ windowId: recording.windowId });
      this.finishRecording(recording.windowId);
    } catch (error) {
      if (this.state.activeRecording === recording)
        recording.status = previousStatus;
      throw error;
    }
  }

  async initializeSdk(region?: string): Promise<void> {
    if (this.sdkInitialization) await this.sdkInitialization;
    if (this.events.isStopping()) return;
    if (this.sdkRegion && (!region || region === this.sdkRegion)) return;
    this.sdkInitialization = this.startSdk(region).finally(() => {
      this.sdkInitialization = null;
    });
    await this.sdkInitialization;
  }

  private async startSdk(region?: string): Promise<void> {
    if (process.platform !== 'darwin' || process.arch !== 'arm64')
      throw new Error('Recording requires an Apple Silicon Mac.');
    const [major, minor] = process.getSystemVersion().split('.').map(Number);
    if (major < 14 || (major === 14 && minor < 2))
      throw new Error('Audio recording requires macOS 14.2 or later.');
    const apiUrl =
      region ??
      (
        await this.client.companion(
          { action: 'configuration' },
          recordingConfigurationSchema,
        )
      ).apiUrl;
    if (!RECALL_REGIONS.has(apiUrl))
      throw new Error('The workspace returned an unsupported Recall region.');
    if (this.sdkRegion === apiUrl) return;
    await this.stopSdk();
    await RecallAiSdk.init({ apiUrl, acquirePermissionsOnStartup: [] });
    this.sdkRegion = apiUrl;
    this.refreshPermissions();
  }

  private async stopSdk(): Promise<void> {
    if (this.sdkRegion) await RecallAiSdk.shutdown();
    this.sdkRegion = null;
  }

  private async openPermissionSettings(
    permission: 'microphone' | 'system-audio' | 'accessibility',
  ): Promise<void> {
    const pane = {
      microphone: 'Privacy_Microphone',
      accessibility: 'Privacy_Accessibility',
      'system-audio': 'Privacy_ScreenCapture',
    }[permission];
    await shell.openExternal(
      `x-apple.systempreferences:com.apple.preference.security?${pane}`,
    );
  }

  refreshPermissions(): void {
    if (process.platform !== 'darwin') return;
    const accessibility = systemPreferences.isTrustedAccessibilityClient(false);
    const status = accessibility
      ? 'granted'
      : this.state.permissions.accessibility === 'not_requested'
        ? 'not_requested'
        : 'denied';
    // Recall can retain a denial after approval in System Settings.
    // Audio permissions belong to the SDK's capture process.
    if (status !== this.state.permissions.accessibility) {
      this.state.permissions.accessibility = status;
      this.events.emit();
    }
  }

  async requestPermission(
    permission: 'microphone' | 'system-audio' | 'accessibility',
  ): Promise<void> {
    this.refreshPermissions();
    // A known denial must still open Settings when SDK initialization is unavailable.
    if (this.state.permissions[permission] !== 'denied')
      await this.initializeSdk();
    this.refreshPermissions();
    if (this.state.permissions[permission] === 'granted') return;
    if (this.state.permissions[permission] === 'denied') {
      await this.openPermissionSettings(permission);
      return;
    }
    await RecallAiSdk.requestPermission(permission);
  }

  async record(windowId?: string): Promise<void> {
    if (this.state.activeRecording || this.recordingStart) return;
    if (!this.events.canRecord() || this.state.connection !== 'connected')
      throw new Error('Connect your workspace before recording.');
    if (!this.networkConnected)
      throw new Error('Reconnect to the internet before recording.');
    this.recordingStart = this.startRecording(windowId);
    try {
      await this.recordingStart;
    } finally {
      this.recordingStart = null;
    }
  }

  private async startRecording(windowId?: string): Promise<void> {
    let recordingId: string | undefined;
    let selectedWindowId: string | undefined;
    try {
      await this.initializeSdk();
      this.refreshPermissions();
      const missingPermission = (
        ['microphone', 'system-audio', 'accessibility'] as const
      ).find((permission) => this.state.permissions[permission] !== 'granted');
      if (missingPermission) {
        this.state.permissionSetup = { windowId, intent: 'record' };
        this.events.emit();
        this.events.openApp();
        return;
      }
      this.state.permissionSetup = null;
      const detected = windowId
        ? this.state.detectedCalls.find((call) => call.id === windowId)
        : undefined;
      if (windowId && !detected)
        throw new Error('This call has ended. Refresh and try again.');
      if (
        !this.state.updatedAt ||
        Date.now() - Date.parse(this.state.updatedAt) > 90_000
      )
        throw new Error('Refresh your agenda before recording.');
      const calendarEvent = matchMeeting(
        this.state.meetings,
        detected?.url,
        Date.now(),
      );
      if (
        calendarEvent &&
        (calendarEvent.usesCalendarBot || !calendarEvent.recordingEnabled)
      )
        throw new Error(
          'This meeting uses its calendar bot. Desktop recording is available for unscheduled calls.',
        );
      const title =
        calendarEvent?.title ?? detected?.title ?? 'Unscheduled conversation';
      recordingId = randomUUID();
      const upload = await this.client.companion(
        {
          action: 'create-upload',
          sessionId: recordingId,
          title,
          calendarEventId: calendarEvent?.id,
          meetingUrl: detected?.url,
          platform: detected?.platform ?? 'desktop-audio',
        },
        recordingUploadSchema,
      );
      await this.initializeSdk(upload.apiUrl);
      selectedWindowId =
        windowId ?? (await RecallAiSdk.prepareDesktopAudioRecording());
      if (!this.events.canRecord() || !this.networkConnected)
        throw new Error('Recording setup was interrupted. Try again.');
      this.state.activeRecording = {
        id: upload.callRecordingId,
        windowId: selectedWindowId,
        title,
        startedAt: new Date().toISOString(),
        status: 'starting',
      };
      this.events.emit();
      await RecallAiSdk.startRecording({
        windowId: selectedWindowId,
        uploadToken: upload.uploadToken,
      });
      if (
        this.state.activeRecording?.windowId === selectedWindowId &&
        this.state.activeRecording.status === 'starting'
      )
        this.state.activeRecording.status = 'recording';
    } catch (error) {
      if (selectedWindowId && this.state.activeRecording) {
        try {
          await RecallAiSdk.stopRecording({ windowId: selectedWindowId });
        } catch {
          this.state.activeRecording.status = 'recording';
          throw new Error(
            'Capture may still be running. Use Stop recording or quit the app to stop it.',
          );
        }
      }
      this.state.activeRecording = null;
      if (recordingId)
        await this.client
          .companion(
            { action: 'capture-failed', sessionId: recordingId },
            recordingResultSchema,
          )
          .catch(() => undefined);
      throw error;
    } finally {
      this.events.emit();
    }
  }

  listenToRecording(): void {
    const listen = <TEvent extends keyof EventTypeToPayloadMap>(
      event: TEvent,
      listener: (payload: EventTypeToPayloadMap[TEvent]) => void,
    ) => {
      RecallAiSdk.addEventListener(event, listener);
      this.unsubscribeRecording.push(() =>
        RecallAiSdk.removeEventListener(event, listener),
      );
    };
    const detected = (window: RecallAiSdkWindow) => {
      const call = {
        id: window.id,
        title: window.title ?? 'Detected call',
        platform: window.platform ?? 'Meeting',
        url: window.url,
      };
      this.state.detectedCalls = [
        ...this.state.detectedCalls.filter((item) => item.id !== call.id),
        call,
      ];
      this.events.emit();
    };
    const handleDetection = (
      window: RecallAiSdkWindow,
      shouldNotify: boolean,
    ) => {
      if (this.events.isStopping() || this.state.connection !== 'connected')
        return;
      detected(window);
      // Calendar meetings keep their scheduled bot; unsupported platforms can use desktop capture.
      const meeting = matchMeeting(this.state.meetings, window.url, Date.now());
      if (
        this.state.settings.autoRecord &&
        this.state.settings.setupCompleted &&
        this.networkConnected &&
        (!meeting || (meeting.recordingEnabled && !meeting.usesCalendarBot)) &&
        window.url &&
        this.state.updatedAt &&
        Date.now() - Date.parse(this.state.updatedAt) < 90_000 &&
        !this.autoHandledWindows.has(window.id)
      ) {
        this.autoHandledWindows.add(window.id);
        void this.record(window.id).catch((error) => this.events.fail(error));
      } else if (
        shouldNotify &&
        this.state.settings.notifyOnDetectedCall &&
        !meeting?.usesCalendarBot
      )
        this.events.notify(
          'Call detected',
          'Open Twenty to record this conversation.',
        );
    };
    listen('meeting-detected', ({ window }) => handleDetection(window, true));
    listen('meeting-updated', ({ window }) => handleDetection(window, false));
    listen('meeting-closed', ({ window }) => {
      this.autoHandledWindows.delete(window.id);
      this.state.detectedCalls = this.state.detectedCalls.filter(
        (call) => call.id !== window.id,
      );
      this.events.emit();
    });
    listen('recording-started', ({ window }) => {
      if (
        this.state.activeRecording?.windowId === window.id &&
        this.state.activeRecording.status === 'starting'
      )
        this.state.activeRecording.status = 'recording';
      this.events.emit();
    });
    listen('recording-ended', ({ window }) => this.finishRecording(window.id));
    listen('permission-status', ({ permission, status }) => {
      if (
        permission === 'microphone' ||
        permission === 'accessibility' ||
        permission === 'system-audio'
      )
        this.state.permissions[permission] = status;
      this.refreshPermissions();
      this.events.emit();
    });
    listen('network-status', ({ status }) => {
      this.networkConnected = status === 'reconnected';
      if (!this.networkConnected && this.state.activeRecording) {
        this.interruptedByNetwork = true;
        this.state.notice = { type: 'network-lost' };
        this.events.notify(
          'Recording interrupted',
          'Network connection lost. Stopping this recording. Reconnect before starting a new recording.',
        );
        void this.stopRecording().catch((error) => this.events.fail(error));
      } else if (this.networkConnected && this.interruptedByNetwork) {
        this.interruptedByNetwork = false;
        this.state.notice = this.state.activeRecording
          ? { type: 'network-restored-active' }
          : { type: 'network-restored' };
      }
      this.events.emit();
    });
    listen('error', () => {
      this.events.fail(
        new Error(
          this.state.activeRecording
            ? 'Recall reported a capture error. Stop this recording before starting another.'
            : 'Recording is unavailable. Check permissions and try again.',
        ),
      );
    });
    listen('media-capture-status', ({ type, capturing, window }) => {
      if (
        type === 'audio' &&
        !capturing &&
        this.state.activeRecording?.windowId === window.id &&
        this.state.activeRecording.status === 'recording'
      ) {
        this.state.notice = { type: 'audio-interrupted' };
        this.events.emit();
      }
    });
  }

  private finishRecording(windowId: string): void {
    if (this.state.activeRecording?.windowId !== windowId) return;
    const recording = this.state.activeRecording;
    this.state.recordings = [
      {
        id: recording.id,
        title: recording.title,
        status: 'PROCESSING',
        startedAt: recording.startedAt,
        endedAt: new Date().toISOString(),
      },
      ...this.state.recordings.filter((item) => item.id !== recording.id),
    ];
    this.state.activeRecording = null;
    this.state.notice = this.networkConnected
      ? { type: 'recording-finished' }
      : { type: 'recording-stopped-offline' };
    this.events.emit();
    void this.events.refresh().catch((error) => this.events.fail(error));
  }
}
