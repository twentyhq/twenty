import { type CompanionCommand } from '../../shared/types/CompanionCommand';
import { type CompanionState } from '../../shared/types/CompanionState';

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
      Object.assign(next, {
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
    case 'open-recordings':
      next.notice = {
        type: 'preview',
        message:
          'Preview only. This opens all recordings in your Twenty workspace.',
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
