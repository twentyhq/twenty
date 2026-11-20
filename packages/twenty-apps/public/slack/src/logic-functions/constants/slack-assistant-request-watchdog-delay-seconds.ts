import { SLACK_ASSISTANT_REQUEST_TIMEOUT_SECONDS } from 'src/logic-functions/constants/slack-assistant-request-timeout-seconds';

// past the function timeout, so a run that is still alive has always finished
export const SLACK_ASSISTANT_REQUEST_WATCHDOG_DELAY_SECONDS =
  SLACK_ASSISTANT_REQUEST_TIMEOUT_SECONDS + 60;
