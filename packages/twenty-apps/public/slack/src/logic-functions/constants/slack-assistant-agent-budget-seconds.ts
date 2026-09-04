import { SLACK_ASSISTANT_FAILURE_REPLY_RESERVE_SECONDS } from 'src/logic-functions/constants/slack-assistant-failure-reply-reserve-seconds';
import { SLACK_ASSISTANT_WORKER_TIMEOUT_SECONDS } from 'src/logic-functions/constants/slack-assistant-worker-timeout-seconds';

export const SLACK_ASSISTANT_AGENT_BUDGET_SECONDS =
  SLACK_ASSISTANT_WORKER_TIMEOUT_SECONDS -
  SLACK_ASSISTANT_FAILURE_REPLY_RESERVE_SECONDS;
