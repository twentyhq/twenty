import { CALL_RECORDING_REQUEST_FOLLOW_UP_DELAY_MS } from 'src/logic-functions/constants/call-recording-request-follow-up-delay-ms';
import { MILLISECONDS_PER_MINUTE } from 'src/logic-functions/constants/milliseconds-per-minute';
import { SCHEDULED_RECALL_BOT_CANCELLATIONS_PER_MINUTE } from 'src/logic-functions/constants/scheduled-recall-bot-cancellation';

export const MAXIMUM_PLANNED_SCHEDULED_RECALL_BOT_CANCELLATIONS =
  Math.floor(
    CALL_RECORDING_REQUEST_FOLLOW_UP_DELAY_MS / MILLISECONDS_PER_MINUTE,
  ) * SCHEDULED_RECALL_BOT_CANCELLATIONS_PER_MINUTE;
