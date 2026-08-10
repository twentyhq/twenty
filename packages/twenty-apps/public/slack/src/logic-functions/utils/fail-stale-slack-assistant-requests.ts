import { isNonEmptyString } from '@sniptt/guards';
import { CoreApiClient } from 'twenty-client-sdk/core';

import { SLACK_ASSISTANT_REQUEST_STATUS } from 'src/logic-functions/constants/slack-assistant-request-status';
import { SLACK_ASSISTANT_TIMEOUT_TEXT } from 'src/logic-functions/constants/slack-assistant-timeout-text';
import { SLACK_ASSISTANT_WORKER_TIMEOUT_SECONDS } from 'src/logic-functions/constants/slack-assistant-worker-timeout-seconds';
import { findStaleSlackAssistantRequests } from 'src/logic-functions/data/find-stale-slack-assistant-requests';
import { updateSlackAssistantRequest } from 'src/logic-functions/data/update-slack-assistant-request';
import { slackPostMessageHandler } from 'src/logic-functions/handlers/slack-post-message-handler';
import { type StaleSlackAssistantRequest } from 'src/logic-functions/types/stale-slack-assistant-request.type';

const STALE_REQUEST_GRACE_SECONDS = 60;
const STALE_REQUEST_SWEEP_BATCH_SIZE = 50;

const notifySlackAssistantTimeout = async (
  staleRequest: StaleSlackAssistantRequest,
): Promise<void> => {
  const parentMessageTimestamp = isNonEmptyString(
    staleRequest.slackThreadTimestamp,
  )
    ? staleRequest.slackThreadTimestamp
    : staleRequest.slackMessageTimestamp;

  if (
    !isNonEmptyString(staleRequest.slackChannelId) ||
    !isNonEmptyString(parentMessageTimestamp)
  ) {
    return;
  }

  await slackPostMessageHandler({
    slackChannelId: staleRequest.slackChannelId,
    messageText: SLACK_ASSISTANT_TIMEOUT_TEXT,
    parentMessageTimestamp,
  });
};

export const failStaleSlackAssistantRequests = async (): Promise<{
  sweptCount: number;
}> => {
  const client = new CoreApiClient();

  const updatedBefore = new Date(
    Date.now() -
      (SLACK_ASSISTANT_WORKER_TIMEOUT_SECONDS + STALE_REQUEST_GRACE_SECONDS) *
        1000,
  ).toISOString();

  const staleRequests = await findStaleSlackAssistantRequests(client, {
    updatedBefore,
    limit: STALE_REQUEST_SWEEP_BATCH_SIZE,
  });

  for (const staleRequest of staleRequests) {
    await updateSlackAssistantRequest(client, {
      id: staleRequest.id,
      status: SLACK_ASSISTANT_REQUEST_STATUS.FAILED,
      errorMessage: `Stopped before finishing: the run exceeded the ${SLACK_ASSISTANT_WORKER_TIMEOUT_SECONDS}s worker timeout.`,
    });

    await notifySlackAssistantTimeout(staleRequest).catch(() => undefined);
  }

  return { sweptCount: staleRequests.length };
};
