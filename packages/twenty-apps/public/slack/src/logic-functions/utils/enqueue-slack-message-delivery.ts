import { enqueueJobs } from 'twenty-sdk/logic-function';

import { SLACK_DELIVER_MESSAGE_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { type SlackDeliverMessagePayload } from 'src/logic-functions/types/slack-deliver-message-payload.type';

export const enqueueSlackMessageDelivery = async ({
  payload,
  retryAfterSeconds,
}: {
  payload: SlackDeliverMessagePayload;
  retryAfterSeconds: number;
}): Promise<void> => {
  await enqueueJobs({
    logicFunctionUniversalIdentifier:
      SLACK_DELIVER_MESSAGE_UNIVERSAL_IDENTIFIER,
    payloads: [{ ...payload, attempt: (payload.attempt ?? 0) + 1 }],
    delayMs: retryAfterSeconds * 1000,
  });
};
