import { isNonEmptyString } from '@sniptt/guards';
import { CoreApiClient } from 'twenty-client-sdk/core';
import {
  type DatabaseEventPayload,
  defineLogicFunction,
  type ObjectRecordCreateEvent,
} from 'twenty-sdk/define';
import { runAgent } from 'twenty-sdk/logic-function';

import {
  SLACK_ASSISTANT_AGENT_UNIVERSAL_IDENTIFIER,
  SLACK_ASSISTANT_WORKER_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';
import { SLACK_ASSISTANT_FAILURE_TEXT } from 'src/logic-functions/constants/slack-assistant-failure-text';
import { SLACK_ASSISTANT_PLACEHOLDER_TEXT } from 'src/logic-functions/constants/slack-assistant-placeholder-text';
import { SLACK_ASSISTANT_REQUEST_OBJECT_NAME } from 'src/logic-functions/constants/slack-assistant-request-object-name';
import { SLACK_ASSISTANT_REQUEST_STATUS } from 'src/logic-functions/constants/slack-assistant-request-status';
import { updateSlackAssistantRequest } from 'src/logic-functions/data/update-slack-assistant-request';
import { slackPostMessageHandler } from 'src/logic-functions/handlers/slack-post-message-handler';
import { slackUpdateMessageHandler } from 'src/logic-functions/handlers/slack-update-message-handler';
import { type SlackAssistantRequestRecord } from 'src/logic-functions/types/slack-assistant-request-record.type';
import { buildSlackAssistantPrompt } from 'src/logic-functions/utils/build-slack-assistant-prompt';
import { extractAgentResponseText } from 'src/logic-functions/utils/extract-agent-response-text';
import { fetchSlackConversationContext } from 'src/logic-functions/utils/fetch-slack-conversation-context';
import { fetchSlackRequesterName } from 'src/logic-functions/utils/fetch-slack-requester-name';
import { getSlackAssistantParentMessageTimestamp } from 'src/logic-functions/utils/get-slack-assistant-parent-message-timestamp';
import { getSlackClient } from 'src/logic-functions/utils/get-slack-client';
import { subscribeSlackThread } from 'src/logic-functions/utils/subscribe-slack-thread';

type SlackAssistantRequestCreatedEvent = DatabaseEventPayload<
  ObjectRecordCreateEvent<SlackAssistantRequestRecord>
>;

export const slackAssistantWorkerHandler = async (
  event: SlackAssistantRequestCreatedEvent,
): Promise<object> => {
  const record = event.properties.after;

  if (record.status !== SLACK_ASSISTANT_REQUEST_STATUS.PENDING) {
    return { skipped: true, reason: 'Request is not pending' };
  }

  const { slackChannelId, slackMessageTimestamp, requestText } = record;

  if (
    !isNonEmptyString(slackChannelId) ||
    !isNonEmptyString(slackMessageTimestamp) ||
    !isNonEmptyString(requestText)
  ) {
    return { skipped: true, reason: 'Request record is missing fields' };
  }

  const client = new CoreApiClient();

  await updateSlackAssistantRequest(client, {
    id: record.id,
    status: SLACK_ASSISTANT_REQUEST_STATUS.PROCESSING,
  });

  const isDirectMessage = record.slackChannelType === 'im';

  const parentMessageTimestamp = getSlackAssistantParentMessageTimestamp({
    slackThreadTimestamp: record.slackThreadTimestamp,
    slackMessageTimestamp,
    isDirectMessage,
  });

  const placeholderResult = await slackPostMessageHandler({
    slackChannelId,
    messageText: SLACK_ASSISTANT_PLACEHOLDER_TEXT,
    parentMessageTimestamp,
  });

  if (
    !placeholderResult.success ||
    !isNonEmptyString(placeholderResult.slackTs)
  ) {
    await updateSlackAssistantRequest(client, {
      id: record.id,
      status: SLACK_ASSISTANT_REQUEST_STATUS.FAILED,
      errorMessage: `Could not post to Slack: ${placeholderResult.error ?? placeholderResult.message}`,
    });

    return { failed: true, reason: 'Could not post placeholder message' };
  }

  const placeholderTimestamp = placeholderResult.slackTs;

  const finishWithFailure = async (errorMessage: string): Promise<object> => {
    await slackUpdateMessageHandler({
      slackChannelId,
      messageTimestamp: placeholderTimestamp,
      newMessageText: SLACK_ASSISTANT_FAILURE_TEXT,
    });

    await updateSlackAssistantRequest(client, {
      id: record.id,
      status: SLACK_ASSISTANT_REQUEST_STATUS.FAILED,
      errorMessage,
    });

    return { failed: true, reason: errorMessage };
  };

  try {
    const slackClientResult = await getSlackClient();

    const conversationContext = slackClientResult.success
      ? await fetchSlackConversationContext({
          client: slackClientResult.client,
          channelId: slackChannelId,
          threadTimestamp: parentMessageTimestamp ?? '',
          isDirectMessage,
        })
      : undefined;

    const requesterName = slackClientResult.success
      ? await fetchSlackRequesterName({
          client: slackClientResult.client,
          slackUserId: record.slackUserId,
        })
      : undefined;

    const agentResult = await runAgent({
      agentUniversalIdentifier: SLACK_ASSISTANT_AGENT_UNIVERSAL_IDENTIFIER,
      prompt: buildSlackAssistantPrompt({
        requestText,
        requesterName,
        conversationContext,
      }),
    });

    const responseText = extractAgentResponseText(agentResult);

    if (responseText === undefined) {
      return await finishWithFailure(
        agentResult.error ?? 'Agent returned an empty response',
      );
    }

    const updateResult = await slackUpdateMessageHandler({
      slackChannelId,
      messageTimestamp: placeholderTimestamp,
      newMessageText: responseText,
      messageFormat: 'markdown',
    });

    if (!updateResult.success) {
      return await finishWithFailure(
        `Could not update Slack message: ${updateResult.error ?? updateResult.message}`,
      );
    }

    await updateSlackAssistantRequest(client, {
      id: record.id,
      status: SLACK_ASSISTANT_REQUEST_STATUS.DONE,
      responseText,
    });

    if (isNonEmptyString(parentMessageTimestamp)) {
      await subscribeSlackThread({
        channelId: slackChannelId,
        threadTimestamp: parentMessageTimestamp,
      }).catch(() => undefined);
    }

    return { done: true };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unexpected worker error';

    return await finishWithFailure(message);
  }
};

export default defineLogicFunction({
  universalIdentifier: SLACK_ASSISTANT_WORKER_UNIVERSAL_IDENTIFIER,
  name: 'slack-assistant-worker',
  description:
    'Processes queued Slack Assistant Requests: posts a placeholder in the Slack thread, runs the Slack Assistant agent against the workspace, and replaces the placeholder with the answer.',
  timeoutSeconds: 60 * 4,
  handler: slackAssistantWorkerHandler,
  databaseEventTriggerSettings: {
    eventName: `${SLACK_ASSISTANT_REQUEST_OBJECT_NAME}.created`,
  },
});
