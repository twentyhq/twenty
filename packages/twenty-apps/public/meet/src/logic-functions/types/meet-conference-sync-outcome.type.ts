import { type CallRecordingUpsertOutcome } from 'src/logic-functions/types/call-recording-upsert-outcome.type';

export type MeetConferenceSyncOutcome =
  | CallRecordingUpsertOutcome
  | 'NO_ARTIFACT';
