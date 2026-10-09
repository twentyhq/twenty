import { type CallRecordingMediaState } from 'src/logic-functions/types/call-recording-media-state.type';

export type CallRecordingSyncState = CallRecordingMediaState & {
  isDeleted: boolean;
  status: string | undefined;
  title: string | undefined;
  recordingRequestStatus: string | undefined;
  startedAt: string | undefined;
  endedAt: string | undefined;
  calendarEventId: string | undefined;
  hasTranscript: boolean;
  hasSummary: boolean;
};
