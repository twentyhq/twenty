import { SLACK_ASSISTANT_REQUEST_TIMEOUT_SECONDS } from 'src/logic-functions/constants/slack-assistant-request-timeout-seconds';

export const SLACK_ASSISTANT_REQUEST_WATCHDOG_DELAY_SECONDS =
  SLACK_ASSISTANT_REQUEST_TIMEOUT_SECONDS + 60;
