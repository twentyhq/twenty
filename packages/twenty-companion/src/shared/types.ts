import { z } from 'zod';

const preferencesSchema = z.object({
  openShortcut: z.string().min(1).max(100),
  autoJoin: z.boolean(),
  autoRecord: z.boolean(),
  launchAtLogin: z.boolean(),
  appearance: z.enum(['system', 'light', 'dark']),
  notifyOnDetectedCall: z.boolean(),
  showMeetingCountdown: z.boolean(),
});
export const settingsSchema = preferencesSchema.extend({
  setupCompleted: z.boolean(),
});
export type Settings = z.infer<typeof settingsSchema>;
export const DEFAULT_SETTINGS: Settings = {
  openShortcut: 'CommandOrControl+Shift+Space',
  autoJoin: true,
  autoRecord: false,
  launchAtLogin: false,
  appearance: 'system',
  notifyOnDetectedCall: true,
  showMeetingCountdown: true,
  setupCompleted: false,
};

export type Meeting = {
  id: string;
  title: string;
  startsAt: string;
  endsAt: string;
  url: string | null;
  recordingEnabled: boolean;
  usesCalendarBot: boolean;
};

export type Recording = {
  participants?: { id: string; name: string; avatarUrl?: string | null }[];
  id: string;
  title: string;
  status: string;
  startedAt?: string | null;
  endedAt?: string | null;
  calendarEventId?: string | null;
};

export type DetectedCall = {
  id: string;
  title: string;
  platform: string;
  url?: string;
};
export type ActiveRecording = {
  id: string;
  windowId: string;
  title: string;
  startedAt: string;
  status:
    | 'starting'
    | 'recording'
    | 'pausing'
    | 'paused'
    | 'resuming'
    | 'stopping';
  pausedAt?: string;
  pausedMilliseconds?: number;
};
export type Agenda = {
  workspace: { id: string; name: string; logoUrl?: string };
  meetings: Meeting[];
  recordings: Recording[];
  calendarConnected: boolean;
};
export type RecordingConfiguration = { apiUrl: string };
export type RecordingUpload = RecordingConfiguration & {
  callRecordingId: string;
  uploadToken: string;
};
export type RecordingResult = { callRecordingId: string };

export type CompanionError = {
  message: string;
  recovery?: { type: 'open-desktop-installation'; serverUrl: string };
};
export type CompanionNotice =
  | { type: 'preview'; message: string }
  | { type: 'opening-meeting'; title: string }
  | {
      type:
        | 'recording-finished'
        | 'network-lost'
        | 'network-restored-active'
        | 'network-restored'
        | 'audio-interrupted'
        | 'recording-stopped-offline';
    };

export type CompanionState = {
  connection: 'disconnected' | 'connecting' | 'connected';
  serverUrl: string;
  workspace: Agenda['workspace'] | null;
  meetings: Meeting[];
  recordings: Recording[];
  calendarConnected: boolean;
  detectedCalls: DetectedCall[];
  activeRecording: ActiveRecording | null;
  permissions: Record<'microphone' | 'accessibility' | 'system-audio', string>;
  settings: Settings;
  skippedMeetingIds: string[];
  updatedAt: string | null;
  error: CompanionError | null;
  notice: CompanionNotice | null;
  permissionSetup: { windowId?: string; intent?: 'record' } | null;
};

export const commandSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('connect'), serverUrl: z.string().max(2048) }),
  z.object({ type: z.literal('disconnect') }),
  z.object({ type: z.literal('cancel-connect') }),
  z.object({ type: z.literal('refresh') }),
  z.object({
    type: z.literal('settings'),
    settings: preferencesSchema.partial(),
  }),
  z.object({
    type: z.literal('permission'),
    permission: z.enum(['microphone', 'accessibility', 'system-audio']),
  }),
  z.object({ type: z.literal('complete-setup') }),
  z.object({ type: z.literal('begin-permission-setup') }),
  z.object({ type: z.literal('cancel-permission-setup') }),
  z.object({ type: z.literal('join'), meetingId: z.string().uuid() }),
  z.object({ type: z.literal('skip'), meetingId: z.string().uuid() }),
  z.object({ type: z.literal('unskip'), meetingId: z.string().uuid() }),
  z.object({
    type: z.literal('record'),
    windowId: z.string().max(256).optional(),
  }),
  z.object({ type: z.literal('stop') }),
  z.object({ type: z.literal('pause') }),
  z.object({ type: z.literal('resume') }),
  z.object({
    type: z.literal('open-app'),
    page: z.enum(['agenda', 'settings']).optional(),
  }),
  z.object({
    type: z.literal('open-recording'),
    recordingId: z.string().uuid(),
  }),
  z.object({ type: z.literal('open-recordings') }),
  z.object({ type: z.literal('open-calendar-settings') }),
  z.object({
    type: z.literal('open-desktop-installation'),
    serverUrl: z.string(),
  }),
  z.object({ type: z.literal('open-desktop-setup'), serverUrl: z.string() }),
  z.object({ type: z.literal('dismiss-error') }),
]);
export type CompanionCommand = z.infer<typeof commandSchema>;
export type CompanionPage = 'agenda' | 'settings';
export type CompanionBridge = {
  getState: () => Promise<CompanionState>;
  command: (command: CompanionCommand) => Promise<void>;
  onState: (listener: (state: CompanionState) => void) => () => void;
  onNavigate: (listener: (page: CompanionPage) => void) => () => void;
};
