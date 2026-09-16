import { type CompanionState } from '../../shared/types/CompanionState';

export const previewState = (initial: CompanionState): CompanionState => {
  const now = Date.now();
  const at = (minutes: number) =>
    new Date(now + minutes * 60_000).toISOString();
  const scenario = new URLSearchParams(window.location.search).get('preview');
  const state: CompanionState = {
    ...initial,
    connection: 'connected',
    workspace: { id: 'preview', name: 'Acme' },
    calendarConnected: true,
    settings: {
      ...initial.settings,
      setupCompleted: !['welcome', 'permissions', 'denied'].includes(
        scenario ?? '',
      ),
    },
    permissions: ['welcome', 'permissions', 'denied'].includes(scenario ?? '')
      ? {
          microphone: scenario === 'denied' ? 'denied' : 'not_requested',
          'system-audio': 'not_requested',
          accessibility: 'not_requested',
        }
      : {
          microphone: 'granted',
          'system-audio': 'granted',
          accessibility: 'granted',
        },
    updatedAt: at(0),
    meetings: [
      {
        id: '00000000-0000-4000-8000-000000000001',
        title: 'Design sync',
        startsAt: at(7),
        endsAt: at(37),
        url: 'https://meet.google.com/example',
        recordingEnabled: true,
        usesCalendarBot: true,
      },
      {
        id: '00000000-0000-4000-8000-000000000002',
        title: 'Customer conversation',
        startsAt: at(67),
        endsAt: at(97),
        url: 'https://meet.google.com/example-two',
        recordingEnabled: true,
        usesCalendarBot: true,
      },
      {
        id: '00000000-0000-4000-8000-000000000003',
        title: 'Weekly team check-in',
        startsAt: at(127),
        endsAt: at(157),
        url: 'https://meet.google.com/example-three',
        recordingEnabled: false,
        usesCalendarBot: false,
      },
      {
        id: '00000000-0000-4000-8000-000000000007',
        title: 'Project planning',
        startsAt: at(187),
        endsAt: at(217),
        url: 'https://meet.google.com/example-four',
        recordingEnabled: true,
        usesCalendarBot: true,
      },
      {
        id: '00000000-0000-4000-8000-000000000008',
        title: 'Customer onboarding',
        startsAt: at(247),
        endsAt: at(277),
        url: 'https://meet.google.com/example-five',
        recordingEnabled: true,
        usesCalendarBot: true,
      },
    ],
    recordings: [
      {
        id: '00000000-0000-4000-8000-000000000004',
        title: 'A new way to organize your day',
        status: 'COMPLETED',
        startedAt: at(-90),
        endedAt: at(-60),
        participants: [
          { id: 'email:alex@example.com', name: 'Alex Martin' },
          { id: 'email:sam@example.com', name: 'Sam Lee' },
          { id: 'email:jules@example.com', name: 'Jules Garcia' },
        ],
      },
      {
        id: '00000000-0000-4000-8000-000000000005',
        title: 'Product catch-up',
        status: 'PROCESSING',
        startedAt: at(-45),
        endedAt: at(-10),
        participants: [{ id: 'email:morgan@example.com', name: 'Morgan Chen' }],
      },
      {
        id: '00000000-0000-4000-8000-000000000009',
        title: 'Unscheduled conversation',
        status: 'COMPLETED',
        startedAt: at(-180),
        endedAt: at(-160),
        participants: [],
      },
    ],
  };
  if (scenario === 'welcome') {
    state.connection = 'disconnected';
    state.updatedAt = null;
  }
  if (scenario === 'error') {
    state.connection = 'disconnected';
    state.error = {
      message: 'Could not unlock your Twenty connection. Reconnect to Twenty.',
    };
  }
  if (scenario === 'missing-integration') {
    state.error = {
      message:
        'Desktop Recorder is unavailable in this workspace. Install it to continue.',
      recovery: {
        type: 'open-desktop-installation',
        serverUrl: state.serverUrl,
      },
    };
  }
  if (scenario === 'empty') {
    state.recordings = [];
    state.meetings = [];
  }
  if (scenario === 'recording')
    state.activeRecording = {
      id: '00000000-0000-4000-8000-000000000006',
      windowId: 'preview-call',
      title: 'Customer conversation',
      startedAt: at(-4),
      status: 'recording',
    };
  return state;
};
