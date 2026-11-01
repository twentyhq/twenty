import { TEAMS_ASSISTANT_REQUEST_TIMEOUT_SECONDS } from 'src/features/chat/logic-functions/constants/teams-assistant-request-timeout-seconds';

const FAILURE_REPLY_RESERVE_SECONDS = 30;

export const TEAMS_ASSISTANT_AGENT_BUDGET_SECONDS =
  TEAMS_ASSISTANT_REQUEST_TIMEOUT_SECONDS - FAILURE_REPLY_RESERVE_SECONDS;
