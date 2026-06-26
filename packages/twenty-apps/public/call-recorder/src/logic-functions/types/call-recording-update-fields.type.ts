import { type CallRecordingRequestStatus } from 'src/logic-functions/constants/call-recording-request-status';
import { type CallRecordingStatus } from 'src/logic-functions/constants/call-recording-status';
import { type CallRecordingMediaFile } from 'src/logic-functions/types/call-recording-media-file.type';
import { type CallRecordingSummary } from 'src/logic-functions/types/call-recording-summary.type';

export type CallRecordingUpdateFields = Partial<{
  // null clears a previously synced title when the calendar title disappears.
  title: string | null;
  status: CallRecordingStatus;
  recordingRequestStatus: CallRecordingRequestStatus;
  startedAt: string;
  endedAt: string;
  calendarEventId: string;
  // null clears stale app-owned state on cancel/eject or reschedule.
  externalBotId: string | null;
  externalRecordingId: string;
  callRecorderFailureReason: string | null;
  transcript: Record<string, unknown>;
  audio: CallRecordingMediaFile[];
  video: CallRecordingMediaFile[];
  // null clears the transient claim marker when summary generation fails.
  summary: CallRecordingSummary | null;
}>;
