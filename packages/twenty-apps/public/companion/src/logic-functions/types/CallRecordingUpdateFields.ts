import { type DesktopRecordingSession } from 'src/logic-functions/types/DesktopRecordingSession';
import { type CallRecordingRequestStatus } from 'src/logic-functions/constants/CallRecordingRequestStatus';
import { type CallRecordingStatus } from 'src/logic-functions/constants/CallRecordingStatus';
import { type CallRecordingMediaFile } from 'src/logic-functions/types/CallRecordingMediaFile';
import { type CallRecordingSummary } from 'src/logic-functions/types/CallRecordingSummary';

export type CallRecordingUpdateFields = Partial<{
  // null clears a previously synced title when the calendar title disappears.
  title: string | null;
  companionSession: DesktopRecordingSession;
  status: CallRecordingStatus;
  recordingRequestStatus: CallRecordingRequestStatus;
  startedAt: string;
  endedAt: string;
  calendarEventId: string;
  // null clears stale app-owned state on cancel/eject or reschedule.
  externalBotId: string | null;
  externalRecordingId: string;
  companionFailureReason: string | null;
  transcript: Record<string, unknown> | null;
  audio: CallRecordingMediaFile[];
  video: CallRecordingMediaFile[];
  summary: CallRecordingSummary;
  // null releases the concurrent-import lease.
  companionImportClaimedAt: string | null;
}>;
