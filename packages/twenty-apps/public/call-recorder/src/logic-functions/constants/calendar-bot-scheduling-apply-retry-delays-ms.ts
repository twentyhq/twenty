import { MILLISECONDS_PER_MINUTE } from 'src/logic-functions/constants/milliseconds-per-minute';

export const CALENDAR_BOT_SCHEDULING_APPLY_RETRY_DELAYS_MS = [
  MILLISECONDS_PER_MINUTE,
  5 * MILLISECONDS_PER_MINUTE,
  15 * MILLISECONDS_PER_MINUTE,
];
