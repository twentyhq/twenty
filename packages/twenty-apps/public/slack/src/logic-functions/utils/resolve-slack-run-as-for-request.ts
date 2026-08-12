import { type WebClient } from '@slack/web-api';
import { isNonEmptyString } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';
import { isDefined } from 'twenty-sdk/utils';

import { findSlackAssistantRequestCreatedBy } from 'src/logic-functions/data/find-slack-assistant-request-created-by';
import { type SlackThreadMessage } from 'src/logic-functions/types/slack-thread-message.type';
import { type SlackUserIdentity } from 'src/logic-functions/types/slack-user-identity.type';
import { normalizeSlackRequestText } from 'src/logic-functions/utils/normalize-slack-request-text';
import { resolveSlackRunAsWorkspaceMemberId } from 'src/logic-functions/utils/resolve-slack-run-as-workspace-member-id';

const APPLICATION_ACTOR_SOURCE = 'APPLICATION';

// Run-as is only earned by a message the member directed at the assistant: a
// DM, a message carrying the bot mention, or a follow-up in a thread where
// this same member already mentioned the bot. The last leg is deliberately
// personal: an earlier assistant reply to someone else must not turn another
// member's casual thread post into a request on their permissions.
const isMessageAddressedToBot = ({
  requestMessage,
  threadMessages,
  assistantBotUserId,
  isDirectMessage,
}: {
  requestMessage: SlackThreadMessage;
  threadMessages: SlackThreadMessage[];
  assistantBotUserId: string | undefined;
  isDirectMessage: boolean;
}): boolean => {
  if (isDirectMessage) {
    return true;
  }

  if (!isNonEmptyString(assistantBotUserId)) {
    return false;
  }

  const botMention = `<@${assistantBotUserId}>`;

  if ((requestMessage.text ?? '').includes(botMention)) {
    return true;
  }

  const requestTimestamp = Number.parseFloat(requestMessage.ts ?? '');

  return threadMessages.some(
    (message) =>
      message.user === requestMessage.user &&
      Number.parseFloat(message.ts ?? '') < requestTimestamp &&
      (message.text ?? '').includes(botMention),
  );
};

export const resolveSlackRunAsForRequest = async ({
  client,
  slackClient,
  assistantBotUserId,
  identity,
  requestId,
  requestText,
  requestMessage,
  threadMessages,
  isDirectMessage,
}: {
  client: CoreApiClient;
  slackClient: WebClient | undefined;
  assistantBotUserId: string | undefined;
  identity: SlackUserIdentity | undefined;
  requestId: string;
  requestText: string;
  requestMessage: SlackThreadMessage | undefined;
  threadMessages: SlackThreadMessage[];
  isDirectMessage: boolean;
}): Promise<string | undefined> => {
  if (
    !isDefined(slackClient) ||
    !isDefined(identity) ||
    !isDefined(requestMessage) ||
    requestMessage.user !== identity.slackUserId ||
    !isMessageAddressedToBot({
      requestMessage,
      threadMessages,
      assistantBotUserId,
      isDirectMessage,
    })
  ) {
    return undefined;
  }

  const createdBy = await findSlackAssistantRequestCreatedBy(
    client,
    requestId,
  ).catch(() => undefined);

  if (
    !isDefined(createdBy) ||
    createdBy.source !== APPLICATION_ACTOR_SOURCE ||
    isDefined(createdBy.workspaceMemberId)
  ) {
    return undefined;
  }

  const normalize = (text: string) =>
    normalizeSlackRequestText({ text, botUserId: assistantBotUserId });

  if (normalize(requestMessage.text ?? '') !== normalize(requestText)) {
    return undefined;
  }

  return await resolveSlackRunAsWorkspaceMemberId({
    client,
    slackClient,
    identity,
  });
};
