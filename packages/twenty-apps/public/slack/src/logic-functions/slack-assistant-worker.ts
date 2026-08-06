import { isNonEmptyString } from '@sniptt/guards';
import { CoreApiClient } from 'twenty-client-sdk/core';
import {
  type DatabaseEventPayload,
  defineLogicFunction,
  type ObjectRecordCreateEvent,
} from 'twenty-sdk/define';

import {
  SLACK_ASSISTANT_AGENT_UNIVERSAL_IDENTIFIER,
  SLACK_ASSISTANT_WORKER_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';
import { SLACK_ASSISTANT_PLACEHOLDER_TEXT } from 'src/logic-functions/constants/slack-assistant-placeholder-text';
import { SLACK_ASSISTANT_REQUEST_STATUS } from 'src/logic-functions/constants/slack-assistant-request-status';
import { SLACK_ASSISTANT_THINKING_REACTION_EMOJI } from 'src/logic-functions/constants/slack-assistant-thinking-reaction-emoji';
import { SLACK_ASSISTANT_WORKER_TIMEOUT_SECONDS } from 'src/logic-functions/constants/slack-assistant-worker-timeout-seconds';
import { SLACK_MARKDOWN_BLOCK_MAX_LENGTH } from 'src/logic-functions/constants/slack-markdown-block-max-length';
import { updateSlackAssistantRequest } from 'src/logic-functions/data/update-slack-assistant-request';
import { slackPostMessageHandler } from 'src/logic-functions/handlers/slack-post-message-handler';
import { slackUpdateMessageHandler } from 'src/logic-functions/handlers/slack-update-message-handler';
import { type SlackAssistantRequestRecord } from 'src/logic-functions/types/slack-assistant-request-record.type';
import { buildSlackAssistantAnswerBlocks } from 'src/logic-functions/utils/build-slack-assistant-answer-blocks';
import { buildSlackAssistantAnswerText } from 'src/logic-functions/utils/build-slack-assistant-answer-text';
import { buildSlackAssistantPrompt } from 'src/logic-functions/utils/build-slack-assistant-prompt';
import { buildSlackAssistantRequestName } from 'src/logic-functions/utils/build-slack-assistant-request-name';
import { clearSlackAssistantThinkingReaction } from 'src/logic-functions/utils/clear-slack-assistant-thinking-reaction';
import { extractAgentResponseText } from 'src/logic-functions/utils/extract-agent-response-text';
import { fetchSlackAssistantContext } from 'src/logic-functions/utils/fetch-slack-assistant-context';
import { fetchWorkspaceBaseUrl } from 'src/logic-functions/utils/fetch-workspace-base-url';
import { finishSlackAssistantRequestWithFailure } from 'src/logic-functions/utils/finish-slack-assistant-request-with-failure';
import { getSlackAssistantParentMessageTimestamp } from 'src/logic-functions/utils/get-slack-assistant-parent-message-timestamp';
import { runSlackAssistantAgentWithProgress } from 'src/logic-functions/utils/run-slack-assistant-agent-with-progress';
import { runSlackReaction } from 'src/logic-functions/utils/run-slack-reaction';
import { setSlackAssistantThreadTitle } from 'src/logic-functions/utils/set-slack-assistant-thread-title';
import { startSlackAssistantProgressUpdates } from 'src/logic-functions/utils/start-slack-assistant-progress-updates';
import { startSlackAssistantStatusUpdates } from 'src/logic-functions/utils/start-slack-assistant-status-updates';
import { subscribeSlackThread } from 'src/logic-functions/utils/subscribe-slack-thread';

const SLACK_ASSISTANT_REQUEST_OBJECT_NAME = 'slackAssistantRequest';

type SlackAssistantRequestCreatedEvent = DatabaseEventPayload<
  ObjectRecordCreateEvent<SlackAssistantRequestRecord>
>;

export const slackAssistantWorkerHandler = async (
  event: SlackAssistantRequestCreatedEvent,
): Promise<object> => {
  const startedAt = Date.now();
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

  // DMs use the native agent surface (thread status, threaded replies);
  // channels keep the reaction + placeholder pattern
  const isDirectMessage = record.slackChannelType === 'im';

  const parentMessageTimestamp = getSlackAssistantParentMessageTimestamp({
    slackThreadTimestamp: record.slackThreadTimestamp,
    slackMessageTimestamp,
  });

  let placeholderTimestamp: string | undefined;

  if (!isDirectMessage) {
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

    placeholderTimestamp = placeholderResult.slackTs;
  }

  const failureContext = {
    client,
    requestId: record.id,
    slackChannelId,
    slackMessageTimestamp,
    parentMessageTimestamp,
    placeholderTimestamp,
  };

  try {
    const [{ conversationContext, requesterName }, workspaceBaseUrl] =
      await Promise.all([
        fetchSlackAssistantContext({
          slackChannelId,
          parentMessageTimestamp,
          slackUserId: record.slackUserId,
          excludeMessageTimestamps: [
            slackMessageTimestamp,
            ...(isNonEmptyString(placeholderTimestamp)
              ? [placeholderTimestamp]
              : []),
          ],
        }),
        fetchWorkspaceBaseUrl(),
      ]);

    const agentResult = await runSlackAssistantAgentWithProgress({
      agentUniversalIdentifier: SLACK_ASSISTANT_AGENT_UNIVERSAL_IDENTIFIER,
      prompt: buildSlackAssistantPrompt({
        requestText,
        requesterName,
        conversationContext,
        timeoutSeconds: SLACK_ASSISTANT_WORKER_TIMEOUT_SECONDS,
        workspaceBaseUrl,
      }),
      startProgressUpdates: () =>
        isNonEmptyString(placeholderTimestamp)
          ? startSlackAssistantProgressUpdates({
              slackChannelId,
              placeholderTimestamp,
            })
          : startSlackAssistantStatusUpdates({
              slackChannelId,
              threadTimestamp: parentMessageTimestamp,
            }),
    });

    if (!agentResult.success) {
      return await finishSlackAssistantRequestWithFailure({
        ...failureContext,
        errorMessage: agentResult.error ?? 'Agent execution failed',
      });
    }

    const responseText = extractAgentResponseText(agentResult);

    if (responseText === undefined) {
      return await finishSlackAssistantRequestWithFailure({
        ...failureContext,
        errorMessage: 'Agent returned an empty response',
      });
    }

    const durationMilliseconds = Date.now() - startedAt;
    const answerText = buildSlackAssistantAnswerText({
      responseText,
      durationMilliseconds,
    });
    const answerBlocks =
      responseText.length > SLACK_MARKDOWN_BLOCK_MAX_LENGTH
        ? undefined
        : buildSlackAssistantAnswerBlocks({
            responseText,
            durationMilliseconds,
          });

    const deliveryResult = isNonEmptyString(placeholderTimestamp)
      ? await slackUpdateMessageHandler({
          slackChannelId,
          messageTimestamp: placeholderTimestamp,
          newMessageText: answerText,
          messageFormat: 'markdown',
          messageBlocks: answerBlocks,
        })
      : await slackPostMessageHandler({
          slackChannelId,
          messageText: answerText,
          parentMessageTimestamp,
          messageFormat: 'markdown',
          messageBlocks: answerBlocks,
        });

    if (!deliveryResult.success) {
      return await finishSlackAssistantRequestWithFailure({
        ...failureContext,
        errorMessage: `Could not deliver Slack answer: ${deliveryResult.error ?? deliveryResult.message}`,
      });
    }

    if (!isDirectMessage) {
      await clearSlackAssistantThinkingReaction({
        slackChannelId,
        slackMessageTimestamp,
      });
    }

    await updateSlackAssistantRequest(client, {
      id: record.id,
      status: SLACK_ASSISTANT_REQUEST_STATUS.DONE,
      responseText,
    });

    if (isDirectMessage) {
      await setSlackAssistantThreadTitle({
        slackChannelId,
        threadTimestamp: parentMessageTimestamp,
        title: buildSlackAssistantRequestName(requestText),
      });
    } else {
      await subscribeSlackThread({
        channelId: slackChannelId,
        threadTimestamp: parentMessageTimestamp,
      }).catch(() => undefined);
    }

    return { done: true };
  } catch (error) {
    return await finishSlackAssistantRequestWithFailure({
      ...failureContext,
      errorMessage:
        error instanceof Error ? error.message : 'Unexpected worker error',
    });
  }
};

export default defineLogicFunction({
  universalIdentifier: SLACK_ASSISTANT_WORKER_UNIVERSAL_IDENTIFIER,
  name: 'slack-assistant-worker',
  description:
    'Processes queued Slack Assistant Requests: shows a native thinking status and replies in-thread for DMs, or posts and replaces a placeholder in channels, running the Slack Assistant agent against the workspace.',
  timeoutSeconds: SLACK_ASSISTANT_WORKER_TIMEOUT_SECONDS,
  handler: slackAssistantWorkerHandler,
  databaseEventTriggerSettings: {
    eventName: `${SLACK_ASSISTANT_REQUEST_OBJECT_NAME}.created`,
  },
});
