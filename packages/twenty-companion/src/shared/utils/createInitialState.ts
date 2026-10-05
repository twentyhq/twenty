import { DEFAULT_SETTINGS } from '../constants/DEFAULT_SETTINGS';
import { type CompanionState } from '../types/CompanionState';

export const createInitialState = (): CompanionState => ({
  connection: 'disconnected',
  serverUrl: 'https://api.twenty.com',
  workspace: null,
  meetings: [],
  recordings: [],
  detectedCalls: [],
  activeRecording: null,
  calendarConnected: false,
  permissions: {
    microphone: 'not_requested',
    accessibility: 'not_requested',
    'system-audio': 'not_requested',
  },
  settings: { ...DEFAULT_SETTINGS },
  skippedMeetingIds: [],
  updatedAt: null,
  error: null,
  notice: null,
  permissionSetup: null,
});
