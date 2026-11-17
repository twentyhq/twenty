import { PRE_JOIN_CREDIT_CHECK_SETTINGS_UPDATE_MARGIN_MINUTES } from 'src/logic-functions/constants/pre-join-credit-check-settings-update-margin-minutes';
import { RECALL_BOT_SETTINGS_UPDATE_CUTOFF_MINUTES } from 'src/logic-functions/constants/recall-bot-settings-update-cutoff-minutes';

// Late enough for a top-up to count, early enough for the queue retries of a failed cancellation.
export const PRE_JOIN_CREDIT_CHECK_LEAD_MINUTES =
  RECALL_BOT_SETTINGS_UPDATE_CUTOFF_MINUTES +
  PRE_JOIN_CREDIT_CHECK_SETTINGS_UPDATE_MARGIN_MINUTES;
