import { enqueueJobs } from 'twenty-sdk/logic-function';

import { SLACK_ASSISTANT_REQUEST_WATCHDOG_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { SLACK_ASSISTANT_REQUEST_WATCHDOG_DELAY_SECONDS } from 'src/logic-functions/constants/slack-assistant-request-watchdog-delay-seconds';
import { type SlackAssistantRequestWatchdogPayload } from 'src/logic-functions/types/slack-assistant-request-watchdog-payload.type';

export const enqueueSlackAssistantRequestWatchdog = async (
  payload: SlackAssistantRequestWatchdogPayload,
): Promise<void> => {
  await enqueueJobs({
    logicFunctionUniversalIdentifier:
      SLACK_ASSISTANT_REQUEST_WATCHDOG_UNIVERSAL_IDENTIFIER,
    payloads: [{ ...payload, attempt: (payload.attempt ?? 0) + 1 }],
    delayMs: SLACK_ASSISTANT_REQUEST_WATCHDOG_DELAY_SECONDS * 1000,
  });
};
