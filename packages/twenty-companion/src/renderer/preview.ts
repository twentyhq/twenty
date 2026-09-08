import { type CompanionCommand, type CompanionState } from '../shared/types';

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

export const previewCommand = (
  state: CompanionState,
  command: CompanionCommand,
): CompanionState => {
  const next = structuredClone(state);
  next.error = null;
  switch (command.type) {
    case 'connect':
      next.connection = 'connected';
      next.serverUrl = command.serverUrl;
      next.updatedAt = new Date().toISOString();
      break;
    case 'disconnect':
      next.connection = 'disconnected';
      next.settings.setupCompleted = false;
      break;
    case 'permission':
      next.permissions[command.permission] = 'granted';
      break;
    case 'begin-permission-setup':
      next.permissionSetup = {};
      break;
    case 'cancel-permission-setup':
      next.permissionSetup = null;
      break;
    case 'complete-setup':
      if (
        Object.values(next.permissions).every((status) => status === 'granted')
      ) {
        next.settings.setupCompleted = true;
        next.permissionSetup = null;
      }
      break;
    case 'record':
      if (
        !Object.values(next.permissions).every((status) => status === 'granted')
      ) {
        next.permissionSetup = { windowId: command.windowId, intent: 'record' };
        break;
      }
      next.permissionSetup = null;
      next.activeRecording = {
        id: '00000000-0000-4000-8000-000000000006',
        windowId: 'preview-call',
        title: 'Unscheduled conversation',
        startedAt: new Date().toISOString(),
        status: 'recording',
      };
      break;
    case 'pause':
      if (next.activeRecording) {
        next.activeRecording.status = 'paused';
        next.activeRecording.pausedAt = new Date().toISOString();
      }
      break;
    case 'resume':
      if (next.activeRecording) {
        next.activeRecording.status = 'recording';
        next.activeRecording.pausedMilliseconds =
          (next.activeRecording.pausedMilliseconds ?? 0) +
          (next.activeRecording.pausedAt
            ? Date.now() - Date.parse(next.activeRecording.pausedAt)
            : 0);
        next.activeRecording.pausedAt = undefined;
      }
      break;
    case 'stop':
      if (next.activeRecording)
        next.recordings.unshift({
          id: next.activeRecording.id,
          title: next.activeRecording.title,
          startedAt: next.activeRecording.startedAt,
          endedAt: new Date().toISOString(),
          status: 'PROCESSING',
        });
      next.activeRecording = null;
      next.notice = {
        type: 'preview',
        message:
          'Preview recording finished. Refresh to simulate completed processing.',
      };
      break;
    case 'settings':
      next.settings = { ...next.settings, ...command.settings };
      break;
    case 'skip':
      next.skippedMeetingIds.push(command.meetingId);
      break;
    case 'unskip':
      next.skippedMeetingIds = next.skippedMeetingIds.filter(
        (id) => id !== command.meetingId,
      );
      break;
    case 'join':
      next.notice = {
        type: 'preview',
        message:
          'Preview only. A live meeting link would open in your browser.',
      };
      break;
    case 'open-recording':
      next.notice = {
        type: 'preview',
        message:
          'Preview only. This opens the recording in your Twenty workspace.',
      };
      break;
    case 'open-calendar-settings':
      next.notice = {
        type: 'preview',
        message: 'Preview only. This opens calendar settings in Twenty.',
      };
      break;
    case 'refresh':
      next.recordings.forEach((recording) => {
        if (recording.status === 'PROCESSING') recording.status = 'COMPLETED';
      });
      break;
    case 'dismiss-error':
      next.notice = null;
      break;
  }
  return next;
};
