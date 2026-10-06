import { MILLISECONDS_PER_MINUTE } from 'src/logic-functions/constants/milliseconds-per-minute';

// Lands well after the first try, which a 15-minute function timeout bounds,
// and still inside the 45-minute window where a re-send needs no Recall lookup.
export const CALL_RECORDING_REQUEST_FOLLOW_UP_DELAY_MS =
  30 * MILLISECONDS_PER_MINUTE;
