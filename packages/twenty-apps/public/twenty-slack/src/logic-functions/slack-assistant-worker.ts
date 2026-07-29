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
import { SLACK_ASSISTANT_REQUEST_STATUS } from 'src/logic-functions/constants/slack-assistant-request-status';
import { SLACK_ASSISTANT_THINKING_REACTION_EMOJI } from 'src/logic-functions/constants/slack-assistant-thinking-reaction-emoji';
import { SLACK_ASSISTANT_WORKER_TIMEOUT_SECONDS } from 'src/logic-functions/constants/slack-assistant-worker-timeout-seconds';
import { updateSlackAssistantRequest } from 'src/logic-functions/data/update-slack-assistant-request';
import { slackPostMessageHandler } from 'src/logic-functions/handlers/slack-post-message-handler';
import { slackUpdateMessageHandler } from 'src/logic-functions/handlers/slack-update-message-handler';
import { type SlackAssistantRequestRecord } from 'src/logic-functions/types/slack-assistant-request-record.type';
import { buildSlackAssistantPrompt } from 'src/logic-functions/utils/build-slack-assistant-prompt';
import { clearSlackAssistantThinkingReaction } from 'src/logic-functions/utils/clear-slack-assistant-thinking-reaction';
import { extractAgentResponseText } from 'src/logic-functions/utils/extract-agent-response-text';
import { fetchSlackAssistantContext } from 'src/logic-functions/utils/fetch-slack-assistant-context';
import { finishSlackAssistantRequestWithFailure } from 'src/logic-functions/utils/finish-slack-assistant-request-with-failure';
import { getSlackAssistantParentMessageTimestamp } from 'src/logic-functions/utils/get-slack-assistant-parent-message-timestamp';
import { runSlackReaction } from 'src/logic-functions/utils/run-slack-reaction';
import { subscribeSlackThread } from 'src/logic-functions/utils/subscribe-slack-thread';

const SLACK_ASSISTANT_PLACEHOLDER_TEXT = '_Looking into it…_';
const SLACK_ASSISTANT_REQUEST_OBJECT_NAME = 'slackAssistantRequest';

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

  await runSlackReaction({
    operation: 'add',
    slackChannelId,
    messageTimestamp: slackMessageTimestamp,
    emojiName: SLACK_ASSISTANT_THINKING_REACTION_EMOJI,
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
    await clearSlackAssistantThinkingReaction({
      slackChannelId,
      slackMessageTimestamp,
    });
    await updateSlackAssistantRequest(client, {
      id: record.id,
      status: SLACK_ASSISTANT_REQUEST_STATUS.FAILED,
      errorMessage: `Could not post to Slack: ${placeholderResult.error ?? placeholderResult.message}`,
    });

    return { failed: true, reason: 'Could not post placeholder message' };
  }

  const placeholderTimestamp = placeholderResult.slackTs;

  const finishWithFailure = (errorMessage: string): Promise<object> =>
    finishSlackAssistantRequestWithFailure({
      client,
      requestId: record.id,
      slackChannelId,
      slackMessageTimestamp,
      placeholderTimestamp,
      errorMessage,
    });

  try {
    const { conversationContext, requesterName } =
      await fetchSlackAssistantContext({
        slackChannelId,
        parentMessageTimestamp,
        isDirectMessage,
        slackUserId: record.slackUserId,
        excludeMessageTimestamps: [slackMessageTimestamp, placeholderTimestamp],
      });

    const agentResult = await runAgent({
      agentUniversalIdentifier: SLACK_ASSISTANT_AGENT_UNIVERSAL_IDENTIFIER,
      prompt: buildSlackAssistantPrompt({
        requestText,
        requesterName,
        conversationContext,
        timeoutSeconds: SLACK_ASSISTANT_WORKER_TIMEOUT_SECONDS,
      }),
    });

    if (!agentResult.success) {
      return await finishWithFailure(
        agentResult.error ?? 'Agent execution failed',
      );
    }

    const responseText = extractAgentResponseText(agentResult);

    if (responseText === undefined) {
      return await finishWithFailure('Agent returned an empty response');
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

    await clearSlackAssistantThinkingReaction({
      slackChannelId,
      slackMessageTimestamp,
    });

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
    return await finishWithFailure(
      error instanceof Error ? error.message : 'Unexpected worker error',
    );
  }
};

export default defineLogicFunction({
  universalIdentifier: SLACK_ASSISTANT_WORKER_UNIVERSAL_IDENTIFIER,
  name: 'slack-assistant-worker',
  description:
    'Processes queued Slack Assistant Requests: posts a placeholder in the Slack thread, runs the Slack Assistant agent against the workspace, and replaces the placeholder with the answer.',
  timeoutSeconds: SLACK_ASSISTANT_WORKER_TIMEOUT_SECONDS,
  handler: slackAssistantWorkerHandler,
  databaseEventTriggerSettings: {
    eventName: `${SLACK_ASSISTANT_REQUEST_OBJECT_NAME}.created`,
  },
});
