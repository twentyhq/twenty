import { createDeferred } from './create-deferred';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DEFAULT_SETTINGS } from '../../shared/types';
import { nativeTheme } from 'electron';

const mocks = vi.hoisted(() => ({
  listeners: new Map<string, (event: Record<string, unknown>) => void>(),
  init: vi.fn(),
  shutdown: vi.fn(),
  start: vi.fn(),
  stop: vi.fn(),
  pause: vi.fn(),
  resume: vi.fn(),
  openApp: vi.fn(),
  focusApp: vi.fn(),
  writeSettings: vi.fn(),
  prepare: vi.fn(),
  permission: vi.fn(),
  request: vi.fn(),
  open: vi.fn(),
  restore: vi.fn(),
  handled: vi.fn(),
  connect: vi.fn(),
  oauth: vi.fn(),
  accessibilityTrusted: vi.fn(),
  loginSettings: vi.fn(),
  registerShortcut: vi.fn(),
  readSettings: vi.fn(),
  notification: vi.fn(),
  showNotification: vi.fn(),
}));
vi.mock('electron', () => ({
  app: {
    getPath: () => '/tmp/twenty-companion-test',
    focus: mocks.focusApp,
    setLoginItemSettings: mocks.loginSettings,
  },
  nativeTheme: { themeSource: 'system' },
  shell: { openExternal: mocks.open },
  systemPreferences: {
    isTrustedAccessibilityClient: mocks.accessibilityTrusted,
  },
  Notification: class {
    constructor(options: unknown) {
      mocks.notification(options);
    }
    static isSupported() {
      return true;
    }
    on = vi.fn();
    show = mocks.showNotification;
  },
}));
vi.mock('@recallai/desktop-sdk', () => ({
  default: {
    init: mocks.init,
    shutdown: mocks.shutdown,
    startRecording: mocks.start,
    stopRecording: mocks.stop,
    pauseRecording: mocks.pause,
    resumeRecording: mocks.resume,
    prepareDesktopAudioRecording: mocks.prepare,
    requestPermission: mocks.permission,
    removeEventListener: (name: string) => mocks.listeners.delete(name),
    addEventListener: (
      name: string,
      callback: (event: Record<string, unknown>) => void,
    ) => mocks.listeners.set(name, callback),
  },
}));
vi.mock('../secure-store', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../secure-store')>()),
  SecureStore: class {
    readSettings = mocks.readSettings;
    readHandledMeetings = async () => [];
    writeHandledMeetings = mocks.handled;
    writeSettings = mocks.writeSettings;
  },
}));
vi.mock('../oauth', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../oauth')>()),
  connectOAuth: mocks.oauth,
}));
vi.mock('../twenty-client', () => ({
  TwentyClient: class {
    workspaceUrl = 'https://acme.twenty.com';
    restore = mocks.restore;
    connect = mocks.connect;
    companion = mocks.request;
    disconnect = vi.fn();
  },
}));
import { Companion } from '../companion';

let companion: Companion;
beforeEach(async () => {
  vi.clearAllMocks();
  vi.useFakeTimers();
  mocks.listeners.clear();
  mocks.accessibilityTrusted.mockReturnValue(false);
  mocks.readSettings.mockResolvedValue({ ...DEFAULT_SETTINGS });
  mocks.writeSettings.mockResolvedValue(undefined);
  Object.defineProperty(process, 'getSystemVersion', {
    configurable: true,
    value: () => '15.0.0',
  });
  mocks.restore.mockResolvedValue({ serverUrl: 'https://api.twenty.com' });
  mocks.request.mockImplementation(async (body: { action: string }) => {
    if (body.action === 'configuration')
      return { apiUrl: 'https://eu-central-1.recall.ai' };
    if (body.action === 'agenda')
      return {
        workspace: { id: 'workspace-1', name: 'Acme' },
        meetings: [],
        recordings: [],
        calendarConnected: true,
      };
    if (body.action === 'create-upload')
      return {
        callRecordingId: 'recording-1',
        uploadToken: 'ephemeral-upload-token',
        apiUrl: 'https://eu-central-1.recall.ai',
      };
    return {};
  });
  mocks.prepare.mockResolvedValue('system-audio-window');
  mocks.stop.mockResolvedValue(undefined);
  mocks.start.mockResolvedValue(undefined);
  companion = new Companion(
    () => undefined,
    mocks.openApp,
    mocks.registerShortcut,
  );
  await companion.initialize();
});
afterEach(async () => {
  await companion.shutdown();
  vi.useRealTimers();
});
const allowPermissions = () => {
  mocks.accessibilityTrusted.mockReturnValue(true);
  for (const permission of ['microphone', 'accessibility', 'system-audio'])
    mocks.listeners.get('permission-status')?.({
      permission,
      status: 'granted',
    });
};

describe('desktop capture lifecycle', () => {
  it('opens the recording library on the workspace frontend', async () => {
    await companion.command({ type: 'open-recordings' });
    expect(mocks.open).toHaveBeenCalledWith(
      'https://acme.twenty.com/objects/callRecordings',
    );
  });

  it('brings Companion forward after authorization while the workspace finishes connecting', async () => {
    const authorization = createDeferred();
    const workspace = createDeferred<void>();
    mocks.oauth.mockReturnValueOnce(authorization.promise);
    mocks.connect.mockReturnValueOnce(workspace.promise);
    const pending = companion.command({
      type: 'connect',
      serverUrl: 'https://first.twenty.com',
    });
    expect(mocks.openApp).not.toHaveBeenCalled();
    authorization.resolve({ serverUrl: 'https://first.twenty.com' });
    await vi.waitFor(() => expect(mocks.connect).toHaveBeenCalled());
    expect(mocks.openApp).toHaveBeenCalledTimes(1);
    if (process.platform === 'darwin')
      expect(mocks.focusApp).toHaveBeenCalledWith({ steal: true });
    expect(companion.state.connection).toBe('connecting');
    workspace.resolve();
    await pending;
    expect(companion.state.connection).toBe('connected');
  });

  it('cancels a pending sign-in and allows another workspace attempt', async () => {
    mocks.oauth.mockImplementation(
      (_url: string, _open: unknown, signal: AbortSignal) =>
        new Promise((_resolve, reject) =>
          signal.addEventListener('abort', () => reject(new Error('Canceled'))),
        ),
    );
    const pending = companion.command({
      type: 'connect',
      serverUrl: 'https://first.twenty.com',
    });
    expect(companion.state.connection).toBe('connecting');
    await companion.command({ type: 'cancel-connect' });
    await pending;
    expect(companion.state.connection).not.toBe('connecting');
    expect(companion.state.error).toBeNull();
    expect(mocks.connect).not.toHaveBeenCalled();
    const retry = companion.command({
      type: 'connect',
      serverUrl: 'https://second.twenty.com',
    });
    expect(mocks.oauth).toHaveBeenLastCalledWith(
      'https://second.twenty.com',
      expect.any(Function),
      expect.any(AbortSignal),
    );
    await companion.command({ type: 'cancel-connect' });
    await retry;
  });

  it('ignores credentials returned after cancellation', async () => {
    const result = createDeferred();
    mocks.oauth.mockReturnValue(result.promise);
    const pending = companion.command({
      type: 'connect',
      serverUrl: 'https://first.twenty.com',
    });
    await companion.command({ type: 'cancel-connect' });
    result.resolve({ serverUrl: 'https://first.twenty.com' });
    await pending;
    expect(mocks.connect).not.toHaveBeenCalled();
    expect(companion.state.error).toBeNull();
    expect(mocks.openApp).not.toHaveBeenCalled();
    expect(mocks.focusApp).not.toHaveBeenCalled();
  });

  it('registers saved shortcuts and persists a replacement', async () => {
    expect(mocks.registerShortcut).toHaveBeenCalledWith(
      DEFAULT_SETTINGS.openShortcut,
    );
    await companion.command({
      type: 'settings',
      settings: { openShortcut: 'Control+Alt+K' },
    });
    expect(mocks.registerShortcut).toHaveBeenLastCalledWith('Control+Alt+K');
    expect(companion.state.settings.openShortcut).toBe('Control+Alt+K');
    expect(mocks.writeSettings).toHaveBeenLastCalledWith(
      expect.objectContaining({ openShortcut: 'Control+Alt+K' }),
    );
  });

  it('keeps the previous shortcut when registration fails', async () => {
    mocks.registerShortcut.mockImplementationOnce(() => {
      throw new Error('Shortcut in use');
    });
    await companion.command({
      type: 'settings',
      settings: { openShortcut: 'Control+Alt+K' },
    });
    expect(companion.state.settings.openShortcut).toBe(
      DEFAULT_SETTINGS.openShortcut,
    );
    expect(companion.state.error?.message).toBe('Shortcut in use');
  });

  it('restores the shortcut if saving fails', async () => {
    mocks.writeSettings.mockRejectedValueOnce(new Error('Cannot save'));
    await companion.command({
      type: 'settings',
      settings: { openShortcut: 'Control+Alt+K' },
    });
    expect(mocks.registerShortcut).toHaveBeenLastCalledWith(
      DEFAULT_SETTINGS.openShortcut,
    );
    expect(companion.state.settings.openShortcut).toBe(
      DEFAULT_SETTINGS.openShortcut,
    );
  });

  it('applies saved appearance at startup and changes it without changing launch at login', async () => {
    await companion.shutdown();
    mocks.readSettings.mockResolvedValue({
      ...DEFAULT_SETTINGS,
      appearance: 'dark',
    });
    await companion.initialize();
    expect(nativeTheme.themeSource).toBe('dark');
    await companion.command({
      type: 'settings',
      settings: { ...companion.state.settings, appearance: 'light' },
    });
    expect(nativeTheme.themeSource).toBe('light');
    expect(mocks.writeSettings).toHaveBeenLastCalledWith(
      expect.objectContaining({ appearance: 'light' }),
    );
    expect(mocks.loginSettings).not.toHaveBeenCalled();
    await companion.command({
      type: 'settings',
      settings: { ...companion.state.settings, launchAtLogin: true },
    });
    expect(mocks.loginSettings).toHaveBeenCalledWith({
      openAtLogin: true,
      args: ['--background'],
    });
  });

  it('retains the current settings when saving a preference fails', async () => {
    mocks.writeSettings.mockRejectedValueOnce(
      new Error('Could not save preferences'),
    );
    await companion.command({
      type: 'settings',
      settings: { ...companion.state.settings, appearance: 'dark' },
    });
    expect(companion.state.settings.appearance).toBe('system');
    expect(nativeTheme.themeSource).toBe('system');
    expect(companion.state.error?.message).toBe('Could not save preferences');
  });

  it('mutes call detection prompts without disabling detection or recording interruption alerts', async () => {
    const event = {
      window: {
        id: 'call-window',
        title: 'Quick call',
        url: 'https://meet.google.com/adhoc',
      },
    };
    mocks.listeners.get('meeting-detected')?.(event);
    expect(mocks.notification).toHaveBeenLastCalledWith(
      expect.objectContaining({ title: 'Call detected' }),
    );
    await companion.command({
      type: 'settings',
      settings: { ...companion.state.settings, notifyOnDetectedCall: false },
    });
    mocks.notification.mockClear();
    mocks.listeners.get('meeting-detected')?.(event);
    expect(mocks.notification).not.toHaveBeenCalled();
    expect(companion.state.detectedCalls).toHaveLength(1);
    allowPermissions();
    await companion.command({ type: 'record' });
    mocks.listeners.get('network-status')?.({ status: 'disconnected' });
    expect(mocks.notification).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Recording interrupted' }),
    );
  });

  it('restores meeting detection without requesting permissions at startup', () => {
    expect(mocks.init).toHaveBeenCalledWith({
      apiUrl: 'https://eu-central-1.recall.ai',
      acquirePermissionsOnStartup: [],
    });
  });
  it('does not obtain an upload until all capture permissions are granted', async () => {
    await companion.command({ type: 'record' });
    expect(companion.state.error).toBeNull();
    expect(companion.state.permissionSetup).toEqual({
      windowId: undefined,
      intent: 'record',
    });
    expect(mocks.permission).not.toHaveBeenCalled();
    expect(mocks.openApp).toHaveBeenCalledOnce();
    expect(mocks.start).not.toHaveBeenCalled();
    expect(
      mocks.request.mock.calls.some(
        ([body]) => body.action === 'create-upload',
      ),
    ).toBe(false);
  });
  it('opens macOS settings for a previously denied permission without prompting again', async () => {
    companion.state.permissions.microphone = 'denied';
    await companion.command({ type: 'record' });
    expect(mocks.open).not.toHaveBeenCalled();
    await companion.command({ type: 'permission', permission: 'microphone' });
    expect(mocks.permission).not.toHaveBeenCalled();
    expect(mocks.open).toHaveBeenCalledWith(
      'x-apple.systempreferences:com.apple.preference.security?Privacy_Microphone',
    );
    expect(companion.state.permissionSetup).not.toBeNull();
  });
  it('guides the user to the next missing permission and retains the selected call', async () => {
    companion.state.permissions.microphone = 'granted';
    await companion.command({ type: 'record', windowId: 'call-1' });
    expect(mocks.permission).not.toHaveBeenCalled();
    expect(companion.state.permissionSetup).toEqual({
      windowId: 'call-1',
      intent: 'record',
    });
    await companion.command({ type: 'permission', permission: 'system-audio' });
    expect(mocks.permission).toHaveBeenCalledWith('system-audio');
  });
  it('does not start recording when permissions change, and lets the user dismiss setup', async () => {
    await companion.command({ type: 'record' });
    allowPermissions();
    expect(mocks.start).not.toHaveBeenCalled();
    expect(companion.state.permissionSetup).not.toBeNull();
    await companion.command({ type: 'cancel-permission-setup' });
    expect(companion.state.permissionSetup).toBeNull();
  });
  it('recognizes approval in System Settings without prompting or restarting capture', async () => {
    companion.state.permissions.accessibility = 'denied';
    mocks.accessibilityTrusted.mockReturnValue(true);
    companion.refreshPermissions();
    expect(companion.state.permissions.accessibility).toBe('granted');
    expect(mocks.accessibilityTrusted).toHaveBeenLastCalledWith(false);
    await companion.command({
      type: 'permission',
      permission: 'accessibility',
    });
    expect(mocks.open).not.toHaveBeenCalled();
    expect(mocks.permission).not.toHaveBeenCalled();
    expect(mocks.shutdown).not.toHaveBeenCalled();
    expect(mocks.start).not.toHaveBeenCalled();
  });
  it('updates the open setup guide after approval even with auto-join disabled', async () => {
    await companion.command({ type: 'record' });
    companion.state.settings.autoJoin = false;
    mocks.accessibilityTrusted.mockReturnValue(true);
    await vi.advanceTimersByTimeAsync(1000);
    expect(companion.state.permissions.accessibility).toBe('granted');
    expect(companion.state.permissions.microphone).toBe('not_requested');
    expect(companion.state.permissions['system-audio']).toBe('not_requested');
    expect(mocks.start).not.toHaveBeenCalled();
  });
  it('does not let a delayed SDK denial overwrite current macOS approval', () => {
    mocks.accessibilityTrusted.mockReturnValue(true);
    mocks.listeners.get('permission-status')?.({
      permission: 'accessibility',
      status: 'denied',
    });
    expect(companion.state.permissions.accessibility).toBe('granted');
  });
  it('recognizes revoked native permissions and blocks a new recording', async () => {
    allowPermissions();
    mocks.accessibilityTrusted.mockReturnValue(false);
    await companion.command({ type: 'record' });
    expect(companion.state.permissions.accessibility).toBe('denied');
    expect(companion.state.permissionSetup).not.toBeNull();
    expect(mocks.start).not.toHaveBeenCalled();
    await companion.command({
      type: 'permission',
      permission: 'accessibility',
    });
    expect(mocks.open).toHaveBeenCalledWith(
      'x-apple.systempreferences:com.apple.preference.security?Privacy_Accessibility',
    );
  });
  it.each([
    ['microphone', 'Privacy_Microphone'],
    ['system-audio', 'Privacy_ScreenCapture'],
    ['accessibility', 'Privacy_Accessibility'],
  ] as const)(
    'opens Settings for denied %s even when SDK initialization fails',
    async (permission, pane) => {
      await companion.shutdown();
      mocks.init.mockRejectedValueOnce(new Error('SDK unavailable'));
      await companion.initialize();
      expect(companion.state.error).not.toBeNull();
      companion.state.permissions[permission] = 'denied';
      mocks.init.mockClear();
      await companion.command({ type: 'permission', permission });
      expect(mocks.init).not.toHaveBeenCalled();
      expect(mocks.permission).not.toHaveBeenCalled();
      expect(mocks.open).toHaveBeenLastCalledWith(
        `x-apple.systempreferences:com.apple.preference.security?${pane}`,
      );
      expect(companion.state.error).toBeNull();
    },
  );
  it.each(['microphone', 'system-audio', 'accessibility'] as const)(
    'requests the native %s prompt before offering Settings after a denial',
    async (permission) => {
      mocks.permission.mockImplementationOnce(async () => {
        mocks.listeners.get('permission-status')?.({
          permission,
          status: 'denied',
        });
      });
      await companion.command({ type: 'permission', permission });
      expect(mocks.permission).toHaveBeenCalledWith(permission);
      expect(mocks.open).not.toHaveBeenCalled();
      expect(companion.state.permissions[permission]).toBe('denied');

      await companion.command({ type: 'permission', permission });
      expect(mocks.permission).toHaveBeenCalledOnce();
      const pane = {
        microphone: 'Privacy_Microphone',
        'system-audio': 'Privacy_ScreenCapture',
        accessibility: 'Privacy_Accessibility',
      }[permission];
      expect(mocks.open).toHaveBeenCalledWith(
        `x-apple.systempreferences:com.apple.preference.security?${pane}`,
      );
    },
  );
  it('records system audio with a server upload token and keeps that token out of renderer state', async () => {
    allowPermissions();
    await companion.command({ type: 'record' });
    expect(mocks.prepare).toHaveBeenCalledOnce();
    expect(mocks.start).toHaveBeenCalledWith({
      windowId: 'system-audio-window',
      uploadToken: 'ephemeral-upload-token',
    });
    expect(JSON.stringify(companion.state)).not.toContain(
      'ephemeral-upload-token',
    );
    mocks.listeners.get('recording-started')?.({
      window: { id: 'system-audio-window' },
    });
    expect(companion.state.activeRecording?.status).toBe('recording');
    await companion.command({ type: 'stop' });
    expect(mocks.stop).toHaveBeenCalledWith({
      windowId: 'system-audio-window',
    });
    mocks.listeners.get('recording-ended')?.({
      window: { id: 'system-audio-window' },
    });
    expect(companion.state.activeRecording).toBeNull();
    expect(companion.state.notice?.type).toBe('recording-finished');
  });
  it.each([
    ['zoom', 'https://zoom.us/j/123456789'],
    ['microsoft_teams', 'https://teams.microsoft.com/l/meetup-join/call'],
    ['google_meet', 'https://meet.google.com/abc-defg-hij'],
    ['slack', undefined],
  ])(
    'records a detected %s call with its own capture window',
    async (platform, url) => {
      allowPermissions();
      mocks.listeners.get('meeting-detected')?.({
        window: { id: 'provider-window', title: 'Team call', platform, url },
      });
      await companion.command({ type: 'record', windowId: 'provider-window' });
      expect(mocks.prepare).not.toHaveBeenCalled();
      expect(mocks.start).toHaveBeenCalledWith({
        windowId: 'provider-window',
        uploadToken: 'ephemeral-upload-token',
      });
      expect(mocks.request).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'create-upload',
          platform,
          meetingUrl: url,
        }),
        expect.anything(),
      );
    },
  );
  it('blocks a matching bot call but allows one manual recording during an unrelated calendar event', async () => {
    allowPermissions();
    companion.state.settings.autoRecord = true;
    companion.state.meetings = [
      {
        id: 'event-1',
        title: 'Scheduled',
        startsAt: new Date(Date.now() - 1000).toISOString(),
        endsAt: new Date(Date.now() + 60_000).toISOString(),
        url: 'https://meet.google.com/scheduled',
        recordingEnabled: true,
        usesCalendarBot: true,
      },
    ];
    mocks.listeners.get('meeting-detected')?.({
      window: {
        id: 'window-1',
        url: 'https://meet.google.com/scheduled',
        title: 'Scheduled',
        platform: 'google_meet',
      },
    });
    await companion.command({ type: 'record', windowId: 'window-1' });
    expect(mocks.start).not.toHaveBeenCalled();
    await Promise.all([
      companion.command({ type: 'record' }),
      companion.command({ type: 'record' }),
    ]);
    expect(mocks.start).toHaveBeenCalledOnce();
    expect(mocks.prepare).toHaveBeenCalledOnce();
    expect(mocks.request).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'create-upload',
        platform: 'desktop-audio',
        calendarEventId: undefined,
        meetingUrl: undefined,
      }),
      expect.anything(),
    );
  });
  it('stops an uncertain start before reporting capture failure', async () => {
    allowPermissions();
    mocks.start.mockRejectedValueOnce(new Error('Start timed out'));
    await companion.command({ type: 'record' });
    expect(mocks.stop).toHaveBeenCalledWith({
      windowId: 'system-audio-window',
    });
    expect(companion.state.activeRecording).toBeNull();
    expect(mocks.request).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'capture-failed' }),
      expect.anything(),
    );
  });

  it('shows network interruption without claiming the recording has uploaded', async () => {
    allowPermissions();
    await companion.command({ type: 'record' });
    mocks.listeners.get('network-status')?.({ status: 'disconnected' });
    expect(companion.state.activeRecording).not.toBeNull();
    expect(companion.state.notice?.type).toBe('network-lost');
    await vi.advanceTimersByTimeAsync(0);
    expect(mocks.stop).toHaveBeenCalledOnce();
    expect(companion.state.activeRecording).toBeNull();
    mocks.listeners.get('network-status')?.({ status: 'reconnected' });
    expect(companion.state.notice?.type).toBe('network-restored');
    expect(mocks.start).toHaveBeenCalledOnce();
  });

  it('cannot complete setup until all permissions are enabled and never records just by continuing', async () => {
    await companion.command({ type: 'complete-setup' });
    expect(companion.state.settings.setupCompleted).toBe(false);
    expect(mocks.writeSettings).not.toHaveBeenCalled();
    allowPermissions();
    await companion.command({ type: 'complete-setup' });
    expect(companion.state.settings.setupCompleted).toBe(true);
    expect(mocks.writeSettings).toHaveBeenCalledWith(
      expect.objectContaining({ setupCompleted: true }),
    );
    expect(mocks.start).not.toHaveBeenCalled();
  });

  it('opens permission review without prompting or creating a recording', async () => {
    await companion.command({ type: 'begin-permission-setup' });
    expect(companion.state.permissionSetup).toEqual({});
    expect(mocks.openApp).toHaveBeenCalledOnce();
    expect(mocks.permission).not.toHaveBeenCalled();
    expect(mocks.start).not.toHaveBeenCalled();
  });

  it('pauses and resumes the same recording and excludes paused time', async () => {
    allowPermissions();
    await companion.command({ type: 'record' });
    mocks.listeners.get('recording-started')?.({
      window: { id: 'system-audio-window' },
    });
    await companion.command({ type: 'pause' });
    expect(mocks.pause).toHaveBeenCalledWith({
      windowId: 'system-audio-window',
    });
    expect(companion.state.activeRecording?.status).toBe('paused');
    expect(companion.isRecording).toBe(true);
    await vi.advanceTimersByTimeAsync(10_000);
    await companion.command({ type: 'resume' });
    expect(mocks.resume).toHaveBeenCalledWith({
      windowId: 'system-audio-window',
    });
    expect(companion.state.activeRecording?.status).toBe('recording');
    expect(companion.state.activeRecording?.pausedMilliseconds).toBe(10_000);
    expect(companion.state.activeRecording?.pausedAt).toBeUndefined();
    expect(mocks.start).toHaveBeenCalledOnce();
  });

  it('does not report a successful pause when Recall rejects it', async () => {
    allowPermissions();
    await companion.command({ type: 'record' });
    mocks.listeners.get('recording-started')?.({
      window: { id: 'system-audio-window' },
    });
    mocks.pause.mockRejectedValueOnce(new Error('Could not pause capture'));
    await companion.command({ type: 'pause' });
    expect(companion.state.activeRecording?.status).toBe('recording');
    expect(companion.state.error?.message).toBe('Could not pause capture');
  });

  it('can finish a paused recording and retains the pause if stopping fails', async () => {
    allowPermissions();
    await companion.command({ type: 'record' });
    mocks.listeners.get('recording-started')?.({
      window: { id: 'system-audio-window' },
    });
    await companion.command({ type: 'pause' });
    mocks.stop.mockRejectedValueOnce(new Error('Stop failed'));
    await companion.command({ type: 'stop' });
    expect(companion.state.activeRecording?.status).toBe('paused');
    expect(companion.isRecording).toBe(true);
    await companion.command({ type: 'stop' });
    expect(companion.state.activeRecording).toBeNull();
    expect(companion.isRecording).toBe(false);
  });

  it('does not restore a recording that ended while its pause request was in flight', async () => {
    allowPermissions();
    await companion.command({ type: 'record' });
    mocks.listeners.get('recording-started')?.({
      window: { id: 'system-audio-window' },
    });
    let finishPause: () => void = () => undefined;
    mocks.pause.mockImplementationOnce(
      () =>
        new Promise<void>((resolve) => {
          finishPause = resolve;
        }),
    );
    const pending = companion.command({ type: 'pause' });
    mocks.listeners.get('recording-ended')?.({
      window: { id: 'system-audio-window' },
    });
    finishPause();
    await pending;
    expect(companion.state.activeRecording).toBeNull();
  });

  it('ignores expected audio interruption events during a pause', async () => {
    allowPermissions();
    await companion.command({ type: 'record' });
    mocks.listeners.get('recording-started')?.({
      window: { id: 'system-audio-window' },
    });
    await companion.command({ type: 'pause' });
    mocks.listeners.get('media-capture-status')?.({
      window: { id: 'system-audio-window' },
      type: 'audio',
      capturing: false,
    });
    expect(companion.state.notice).toBeNull();
  });

  it('keeps a finished recording visible while its webhook catches up, then accepts completion', async () => {
    allowPermissions();
    await companion.command({ type: 'record' });
    mocks.listeners.get('recording-ended')?.({
      window: { id: 'system-audio-window' },
    });
    await vi.advanceTimersByTimeAsync(0);
    expect(companion.state.recordings[0]).toMatchObject({
      id: 'recording-1',
      status: 'PROCESSING',
    });
    mocks.request.mockResolvedValueOnce({
      workspace: { id: 'workspace-1', name: 'Acme' },
      meetings: [],
      calendarConnected: true,
      recordings: [
        {
          id: 'recording-1',
          title: 'Unscheduled conversation',
          status: 'COMPLETED',
        },
      ],
    });
    await companion.refresh();
    expect(companion.state.recordings).toHaveLength(1);
    expect(companion.state.recordings[0].status).toBe('COMPLETED');
  });
});

it('merges simultaneous preference changes and does not reset omitted values', async () => {
  const { commandSchema } = await import('../../shared/types');
  await Promise.all([
    companion.command(
      commandSchema.parse({
        type: 'settings',
        settings: { appearance: 'dark' },
      }),
    ),
    companion.command(
      commandSchema.parse({ type: 'settings', settings: { autoJoin: false } }),
    ),
  ]);
  expect(companion.state.settings).toMatchObject({
    appearance: 'dark',
    autoJoin: false,
  });
  expect(mocks.writeSettings).toHaveBeenLastCalledWith(
    expect.objectContaining({ appearance: 'dark', autoJoin: false }),
  );
});

it('keeps controls when stopping after a network failure fails and allows retry', async () => {
  allowPermissions();
  await companion.command({ type: 'record' });
  mocks.stop.mockRejectedValueOnce(new Error('Could not stop capture'));
  mocks.listeners.get('network-status')?.({ status: 'disconnected' });
  await vi.advanceTimersByTimeAsync(0);
  expect(companion.state.activeRecording?.status).toBe('recording');
  expect(companion.state.error?.message).toBe('Could not stop capture');
  await companion.command({ type: 'stop' });
  expect(companion.state.activeRecording).toBeNull();
  await companion.command({ type: 'record' });
  expect(mocks.start).toHaveBeenCalledOnce();
  expect(companion.state.error?.message).toContain('Reconnect to the internet');
});

it('clears workspace data and stops detecting calls after disconnect', async () => {
  companion.state.updatedAt = new Date().toISOString();
  companion.state.recordings = [
    { id: 'recording-1', title: 'Private', status: 'COMPLETED' },
  ];
  mocks.listeners.get('meeting-detected')?.({ window: { id: 'call-1' } });
  await companion.command({ type: 'disconnect' });
  mocks.listeners.get('meeting-detected')?.({ window: { id: 'late-call' } });
  expect(companion.state).toMatchObject({
    connection: 'disconnected',
    workspace: null,
    recordings: [],
    detectedCalls: [],
    calendarConnected: false,
    updatedAt: null,
  });
});

it('waits for a pending setup before shutting down and never starts capture after quitting', async () => {
  allowPermissions();
  const { promise, resolve } = createDeferred<string>();
  mocks.prepare.mockReturnValueOnce(promise);
  const recording = companion.command({ type: 'record' });
  await vi.advanceTimersByTimeAsync(0);
  expect(companion.isRecording).toBe(true);
  const shutdown = companion.shutdown();
  resolve('system-audio-window');
  await Promise.all([recording, shutdown]);
  expect(mocks.start).not.toHaveBeenCalled();
  expect(companion.state.activeRecording).toBeNull();
  expect(mocks.listeners.size).toBe(0);
});

it('waits for pause to settle before stopping and retains a usable state if stop fails', async () => {
  allowPermissions();
  await companion.command({ type: 'record' });
  const { promise, resolve } = createDeferred<void>();
  mocks.pause.mockReturnValueOnce(promise);
  const pause = companion.command({ type: 'pause' });
  const stop = companion.command({ type: 'stop' });
  mocks.stop.mockRejectedValueOnce(new Error('Stop failed'));
  resolve();
  await Promise.all([pause, stop]);
  expect(companion.state.activeRecording?.status).toBe('paused');
  await companion.command({ type: 'stop' });
  expect(companion.state.activeRecording).toBeNull();
});

it('keeps controls usable if quitting fails to stop a recording', async () => {
  allowPermissions();
  await companion.command({ type: 'record' });
  mocks.stop.mockRejectedValueOnce(new Error('Stop failed'));
  await expect(companion.shutdown()).rejects.toThrow('Stop failed');
  await companion.command({ type: 'stop' });
  expect(companion.state.activeRecording).toBeNull();
});

it('does not switch workspaces while recording setup is pending', async () => {
  allowPermissions();
  const prepare = createDeferred<string>();
  mocks.prepare.mockReturnValueOnce(prepare.promise);
  const record = companion.command({ type: 'record' });
  await vi.advanceTimersByTimeAsync(0);
  await companion.command({
    type: 'connect',
    serverUrl: 'https://other.twenty.com',
  });
  expect(mocks.oauth).not.toHaveBeenCalled();
  expect(companion.state.workspace?.name).toBe('Acme');
  prepare.resolve('system-audio-window');
  await record;
});

it('keeps the existing workspace usable when a new login is canceled', async () => {
  mocks.oauth.mockRejectedValueOnce(new Error('Connection canceled'));
  await companion.command({
    type: 'connect',
    serverUrl: 'https://other.twenty.com',
  });
  expect(companion.state.connection).toBe('connected');
  expect(companion.state.workspace?.name).toBe('Acme');
  expect(mocks.shutdown).not.toHaveBeenCalled();
});

it('does not save a new login that finishes after quitting', async () => {
  const oauth = createDeferred<{ serverUrl: string }>();
  mocks.oauth.mockReturnValueOnce(oauth.promise);
  const connect = companion.command({
    type: 'connect',
    serverUrl: 'https://other.twenty.com',
  });
  await companion.shutdown();
  oauth.resolve({ serverUrl: 'https://other.twenty.com' });
  await connect;
  expect(mocks.connect).not.toHaveBeenCalled();
});

it('initializes with recovered settings and reports the recovery after loading the workspace', async () => {
  await companion.shutdown();
  const { SettingsRecoveryError } = await import('../secure-store');
  mocks.readSettings.mockRejectedValueOnce(
    new SettingsRecoveryError(
      {
        ...DEFAULT_SETTINGS,
        autoJoin: false,
        autoRecord: false,
        appearance: 'dark',
      },
      'Review recovered settings',
    ),
  );
  await companion.initialize();
  expect(companion.state.connection).toBe('connected');
  expect(companion.state.settings).toMatchObject({
    autoJoin: false,
    autoRecord: false,
    appearance: 'dark',
  });
  expect(companion.state.error?.message).toBe('Review recovered settings');
  expect(mocks.writeSettings).not.toHaveBeenCalled();
});

it('keeps the installation recovery action with the failure', async () => {
  const { DesktopRecorderUnavailableError } = await import('../oauth');
  mocks.request.mockRejectedValueOnce(
    new DesktopRecorderUnavailableError('https://acme.twenty.com'),
  );
  await companion.command({ type: 'refresh' });
  expect(companion.state.error).toMatchObject({
    recovery: {
      type: 'open-desktop-installation',
      serverUrl: 'https://acme.twenty.com',
    },
  });
  await companion.command({ type: 'dismiss-error' });
  expect(companion.state.error).toBeNull();
});
