import { type Settings } from './Settings';
import { type Meeting } from './Meeting';
import { type Recording } from './Recording';
import { type DetectedCall } from './DetectedCall';
import { type ActiveRecording } from './ActiveRecording';
import { type Agenda } from './Agenda';
import { type CompanionError } from './CompanionError';
import { type CompanionNotice } from './CompanionNotice';

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
