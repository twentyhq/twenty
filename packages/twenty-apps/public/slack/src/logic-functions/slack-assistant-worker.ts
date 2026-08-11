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
import { SLACK_ASSISTANT_REQUEST_STATUS } from 'src/logic-functions/constants/slack-assistant-request-status';
import { SLACK_ASSISTANT_WORKER_TIMEOUT_SECONDS } from 'src/logic-functions/constants/slack-assistant-worker-timeout-seconds';
import { SLACK_MARKDOWN_BLOCK_MAX_LENGTH } from 'src/logic-functions/constants/slack-markdown-block-max-length';
import { updateSlackAssistantRequest } from 'src/logic-functions/data/update-slack-assistant-request';
import { slackPostMessageHandler } from 'src/logic-functions/handlers/slack-post-message-handler';
import { type SlackAssistantRequestRecord } from 'src/logic-functions/types/slack-assistant-request-record.type';
import { buildSlackAssistantAnswerBlocks } from 'src/logic-functions/utils/build-slack-assistant-answer-blocks';
import { buildSlackAssistantAnswerText } from 'src/logic-functions/utils/build-slack-assistant-answer-text';
import { buildSlackAssistantPrompt } from 'src/logic-functions/utils/build-slack-assistant-prompt';
import { buildSlackAssistantRequestName } from 'src/logic-functions/utils/build-slack-assistant-request-name';
import { parseSlackAssistantAnswer } from 'src/logic-functions/utils/parse-slack-assistant-answer';
import { fetchSlackAssistantContext } from 'src/logic-functions/utils/fetch-slack-assistant-context';
import { fetchWorkspaceBaseUrl } from 'src/logic-functions/utils/fetch-workspace-base-url';
import { finishSlackAssistantRequestWithFailure } from 'src/logic-functions/utils/finish-slack-assistant-request-with-failure';
import { getSlackAssistantParentMessageTimestamp } from 'src/logic-functions/utils/get-slack-assistant-parent-message-timestamp';
import { runSlackAssistantAgentWithStatus } from 'src/logic-functions/utils/run-slack-assistant-agent-with-status';
import { setSlackAssistantThreadTitle } from 'src/logic-functions/utils/set-slack-assistant-thread-title';
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

  const isDirectMessage = record.slackChannelType === 'im';

  const isThreadStartingMessage = !isNonEmptyString(record.slackThreadTimestamp);

  const parentMessageTimestamp = getSlackAssistantParentMessageTimestamp({
    slackThreadTimestamp: record.slackThreadTimestamp,
    slackMessageTimestamp,
  });

  const failureContext = {
    client,
    requestId: record.id,
    slackChannelId,
    parentMessageTimestamp,
  };

  try {
    const [{ conversationContext, requesterName }, workspaceBaseUrl] =
      await Promise.all([
        fetchSlackAssistantContext({
          slackChannelId,
          parentMessageTimestamp,
          slackUserId: record.slackUserId,
          excludeMessageTimestamps: [slackMessageTimestamp],
        }),
        fetchWorkspaceBaseUrl(),
      ]);

    const agentResult = await runSlackAssistantAgentWithStatus({
      agentUniversalIdentifier: SLACK_ASSISTANT_AGENT_UNIVERSAL_IDENTIFIER,
      prompt: buildSlackAssistantPrompt({
        requestText,
        requesterName,
        conversationContext,
        timeoutSeconds: SLACK_ASSISTANT_WORKER_TIMEOUT_SECONDS,
        workspaceBaseUrl,
      }),
      slackChannelId,
      threadTimestamp: parentMessageTimestamp,
    });

    if (!agentResult.success) {
      return await finishSlackAssistantRequestWithFailure({
        ...failureContext,
        errorMessage: agentResult.error ?? 'Agent execution failed',
      });
    }

    const answer = parseSlackAssistantAnswer(agentResult);

    if (answer === undefined) {
      return await finishSlackAssistantRequestWithFailure({
        ...failureContext,
        errorMessage: 'Agent returned an empty response',
      });
    }

    const responseText = answer.answer;
    const durationMilliseconds = Date.now() - startedAt;

    const deliveryResult = await slackPostMessageHandler({
      slackChannelId,
      messageText: buildSlackAssistantAnswerText({
        responseText,
        durationMilliseconds,
      }),
      parentMessageTimestamp,
      messageFormat: 'markdown',
      messageBlocks:
        responseText.length > SLACK_MARKDOWN_BLOCK_MAX_LENGTH
          ? undefined
          : buildSlackAssistantAnswerBlocks({
              answer,
              durationMilliseconds,
              workspaceBaseUrl,
            }),
    });

    if (!deliveryResult.success) {
      return await finishSlackAssistantRequestWithFailure({
        ...failureContext,
        errorMessage: `Could not deliver Slack answer: ${deliveryResult.error ?? deliveryResult.message}`,
      });
    }

    await updateSlackAssistantRequest(client, {
      id: record.id,
      status: SLACK_ASSISTANT_REQUEST_STATUS.DONE,
      responseText,
    });

    if (isDirectMessage) {
      if (isThreadStartingMessage) {
        await setSlackAssistantThreadTitle({
          slackChannelId,
          threadTimestamp: parentMessageTimestamp,
          title: buildSlackAssistantRequestName(requestText),
        });
      }
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
    'Processes queued Slack Assistant Requests: shows a native thinking status on the conversation thread, runs the Slack Assistant agent against the workspace, and posts the answer as a threaded reply.',
  timeoutSeconds: SLACK_ASSISTANT_WORKER_TIMEOUT_SECONDS,
  handler: slackAssistantWorkerHandler,
  databaseEventTriggerSettings: {
    eventName: `${SLACK_ASSISTANT_REQUEST_OBJECT_NAME}.created`,
  },
});
