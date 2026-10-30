import { MILLISECONDS_PER_MINUTE } from 'src/logic-functions/constants/milliseconds-per-minute';

// Covers the one-minute pacing slots of a run that arms up to 600 follow-ups at once.
export const CALL_RECORDING_REQUEST_FOLLOW_UP_SLOT_SLACK_MS =
  10 * MILLISECONDS_PER_MINUTE;
