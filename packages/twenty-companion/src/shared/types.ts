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

export const meetingSchema = z.object({
  id: z.string().min(1),
  title: z.string(),
  startsAt: z.iso.datetime({ offset: true }),
  endsAt: z.iso.datetime({ offset: true }),
  url: z.string().nullable(),
  recordingEnabled: z.boolean(),
  usesCalendarBot: z.boolean(),
});
export type Meeting = z.infer<typeof meetingSchema>;

export const recordingOwnerSchema = z.object({
  name: z.string(),
  avatarUrl: z.string().nullish(),
});

export const recordingSchema = z.object({
  participants: z
    .array(recordingOwnerSchema.extend({ id: z.string().min(1) }))
    .optional(),
  id: z.string().min(1),
  title: z.string(),
  status: z.string(),
  startedAt: z.iso.datetime({ offset: true }).nullish(),
  endedAt: z.iso.datetime({ offset: true }).nullish(),
  calendarEventId: z.string().nullish(),
});
export type Recording = z.infer<typeof recordingSchema>;

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
export const agendaSchema = z.object({
  workspace: z.object({
    id: z.string().min(1),
    name: z.string(),
    logoUrl: z.string().optional(),
  }),
  meetings: z.array(meetingSchema),
  recordings: z.array(recordingSchema),
  calendarConnected: z.boolean(),
});
export type Agenda = z.infer<typeof agendaSchema>;
export const recordingConfigurationSchema = z.object({ apiUrl: z.url() });
export const recordingUploadSchema = recordingConfigurationSchema.extend({
  callRecordingId: z.string().min(1),
  uploadToken: z.string().min(1),
});
export const recordingResultSchema = z.object({
  callRecordingId: z.string().min(1),
});

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
