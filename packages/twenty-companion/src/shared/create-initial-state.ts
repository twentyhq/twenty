import { DEFAULT_SETTINGS, type CompanionState } from './types';

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
