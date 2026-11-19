import { type CallRecordingUpsertOutcome } from 'src/logic-functions/types/call-recording-upsert-outcome.type';

export type GoogleMeetConferenceSyncOutcome =
  | CallRecordingUpsertOutcome
  | 'NO_ARTIFACT';
