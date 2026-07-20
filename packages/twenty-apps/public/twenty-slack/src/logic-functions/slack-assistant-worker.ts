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
import { updateSlackAssistantRequest } from 'src/logic-functions/data/slack-assistant-request-store';
import { slackPostMessageHandler } from 'src/logic-functions/handlers/slack-post-message-handler';
import { slackUpdateMessageHandler } from 'src/logic-functions/handlers/slack-update-message-handler';
import { buildSlackAssistantPrompt } from 'src/logic-functions/utils/build-slack-assistant-prompt';
import { extractAgentResponseText } from 'src/logic-functions/utils/extract-agent-response-text';
import { fetchSlackConversationContext } from 'src/logic-functions/utils/fetch-slack-conversation-context';
import { getSlackClient } from 'src/logic-functions/utils/get-slack-client';

const OBJECT_NAME = 'slackAssistantRequest';
const PLACEHOLDER_TEXT = '_Looking into it…_';
const FAILURE_TEXT =
  'Sorry, I could not complete that request. An admin can check the Slack Assistant Request record in Twenty for details.';

type SlackAssistantRequestRecord = {
  id: string;
  status?: string;
  slackChannelId?: string;
  slackChannelType?: string;
  slackThreadTimestamp?: string;
  slackMessageTimestamp?: string;
  slackUserId?: string;
  requestText?: string;
};

type SlackAssistantRequestCreatedEvent = DatabaseEventPayload<
  ObjectRecordCreateEvent<SlackAssistantRequestRecord>
>;

const fetchRequesterName = async (
  slackUserId: string | undefined,
): Promise<string | undefined> => {
  if (!isNonEmptyString(slackUserId)) {
    return undefined;
  }

  const slackClientResult = await getSlackClient();

  if (!slackClientResult.success) {
    return undefined;
  }

  try {
    const userInfo = await slackClientResult.client.users.info({
      user: slackUserId,
    });

    return (
      userInfo.user?.profile?.display_name ||
      userInfo.user?.real_name ||
      undefined
    );
  } catch {
    return undefined;
  }
};

export const slackAssistantWorkerHandler = async (
  event: SlackAssistantRequestCreatedEvent,
): Promise<object> => {
  const [objectName, action] = event.name.split('.');

  if (objectName !== OBJECT_NAME || action !== 'created') {
    return { skipped: true, reason: 'Not a Slack assistant request creation' };
  }

  const record = event.properties.after;

  if (record.status !== SLACK_ASSISTANT_REQUEST_STATUS.PENDING) {
    return { skipped: true, reason: 'Request is not pending' };
  }

  if (
    !isNonEmptyString(record.slackChannelId) ||
    !isNonEmptyString(record.slackMessageTimestamp) ||
    !isNonEmptyString(record.requestText)
  ) {
    return { skipped: true, reason: 'Request record is missing fields' };
  }

  const client = new CoreApiClient();

  await updateSlackAssistantRequest(client, {
    id: record.id,
    status: SLACK_ASSISTANT_REQUEST_STATUS.PROCESSING,
  });

  const isDirectMessage = record.slackChannelType === 'im';

  const parentMessageTimestamp = isNonEmptyString(record.slackThreadTimestamp)
    ? record.slackThreadTimestamp
    : isDirectMessage
      ? undefined
      : record.slackMessageTimestamp;

  const placeholderResult = await slackPostMessageHandler({
    slackChannelId: record.slackChannelId,
    messageText: PLACEHOLDER_TEXT,
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
      slackChannelId: record.slackChannelId ?? '',
      messageTimestamp: placeholderTimestamp,
      newMessageText: FAILURE_TEXT,
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
          channelId: record.slackChannelId,
          threadTimestamp: record.slackThreadTimestamp ?? '',
          isDirectMessage,
        })
      : undefined;

    const requesterName = await fetchRequesterName(record.slackUserId);

    const agentResult = await runAgent({
      agentUniversalIdentifier: SLACK_ASSISTANT_AGENT_UNIVERSAL_IDENTIFIER,
      prompt: buildSlackAssistantPrompt({
        requestText: record.requestText,
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
      slackChannelId: record.slackChannelId,
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
    eventName: `${OBJECT_NAME}.created`,
  },
});
