import { TEAMS_ASSISTANT_REQUEST_TIMEOUT_SECONDS } from 'src/features/chat/logic-functions/constants/teams-assistant-request-timeout-seconds';

// past the function timeout, so a run that is still alive has always finished
export const TEAMS_ASSISTANT_REQUEST_WATCHDOG_DELAY_SECONDS =
  TEAMS_ASSISTANT_REQUEST_TIMEOUT_SECONDS + 60;
