import { enqueueJobs } from 'twenty-sdk/logic-function';

import { TEAMS_ASSISTANT_REQUEST_WATCHDOG_UNIVERSAL_IDENTIFIER } from 'src/features/chat/constants/universal-identifiers';
import { TEAMS_ASSISTANT_REQUEST_WATCHDOG_DELAY_SECONDS } from 'src/features/chat/logic-functions/constants/teams-assistant-request-watchdog-delay-seconds';
import { type TeamsAssistantRequestWatchdogPayload } from 'src/features/chat/logic-functions/types/teams-assistant-request-watchdog-payload.type';

export const enqueueTeamsAssistantRequestWatchdog = async (
  payload: TeamsAssistantRequestWatchdogPayload,
): Promise<void> => {
  await enqueueJobs({
    logicFunctionUniversalIdentifier:
      TEAMS_ASSISTANT_REQUEST_WATCHDOG_UNIVERSAL_IDENTIFIER,
    payloads: [{ ...payload, attempt: (payload.attempt ?? 0) + 1 }],
    delayMs: TEAMS_ASSISTANT_REQUEST_WATCHDOG_DELAY_SECONDS * 1000,
    // the check is idempotent, and a watchdog lost to a platform hiccup leaves the request stuck
    retryLimit: 3,
  });
};
