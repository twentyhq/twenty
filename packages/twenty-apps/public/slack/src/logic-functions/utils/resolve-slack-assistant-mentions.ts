import { type WebClient } from '@slack/web-api';
import { isDefined } from 'twenty-sdk/utils';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import { SLACK_ASSISTANT_MENTION_LABEL } from 'src/logic-functions/constants/slack-assistant-mention-label';
import { SLACK_CONVERSATION_AUTHOR_PREFIX_PATTERN } from 'src/logic-functions/constants/slack-conversation-author-prefix-pattern';
import { type SlackAssistantAgentMessage } from 'src/logic-functions/types/slack-assistant-agent-message.type';
import { type SlackMentionLabel } from 'src/logic-functions/types/slack-mention-label.type';
import { collectSlackMentionedUserIds } from 'src/logic-functions/utils/collect-slack-mentioned-user-ids';
import { resolveSlackMentionLabels } from 'src/logic-functions/utils/resolve-slack-mention-labels';
import { rewriteSlackMentions } from 'src/logic-functions/utils/rewrite-slack-mentions';
import { runWithTimeout } from 'src/logic-functions/utils/run-with-timeout';

const MENTION_RESOLUTION_TIMEOUT_MS = 5_000;

type ResolvedSlackAssistantMentions = {
  requestText: string;
  conversationMessages: SlackAssistantAgentMessage[];
  hasMentionedUsers: boolean;
};

type SplitConversationMessage = {
  message: SlackAssistantAgentMessage;
  authorSlackUserId: string | undefined;
  body: string;
};

const splitAuthorPrefix = (
  message: SlackAssistantAgentMessage,
): SplitConversationMessage => {
  const authorMatch =
    message.role === 'user'
      ? message.content.match(SLACK_CONVERSATION_AUTHOR_PREFIX_PATTERN)
      : null;

  if (authorMatch === null) {
    return { message, authorSlackUserId: undefined, body: message.content };
  }

  return {
    message,
    authorSlackUserId: authorMatch[1],
    body: message.content.slice(authorMatch[0].length),
  };
};

// An author is the person who spoke, not someone the request points at, so the
// prompt names them without the membership claim a mention label carries.
const formatAuthorPrefix = ({
  authorSlackUserId,
  authorLabel,
}: {
  authorSlackUserId: string;
  authorLabel: SlackMentionLabel | undefined;
}): string => {
  if (authorLabel?.label === SLACK_ASSISTANT_MENTION_LABEL) {
    return `${SLACK_ASSISTANT_MENTION_LABEL}: `;
  }

  return isDefined(authorLabel?.name)
    ? `@${authorLabel.name}: `
    : `@unknown Slack user ${authorSlackUserId}: `;
};

export const resolveSlackAssistantMentions = async ({
  requestText,
  conversationMessages,
  client,
  slackClient,
  assistantBotUserId,
}: {
  requestText: string;
  conversationMessages: SlackAssistantAgentMessage[];
  client: CoreApiClient;
  slackClient: WebClient | undefined;
  assistantBotUserId: string | undefined;
}): Promise<ResolvedSlackAssistantMentions> => {
  const splitMessages = conversationMessages.map(splitAuthorPrefix);

  const mentionedUserIds = collectSlackMentionedUserIds([
    requestText,
    ...splitMessages.map(({ body }) => body),
  ]);

  const authorSlackUserIds = splitMessages
    .map(({ authorSlackUserId }) => authorSlackUserId)
    .filter(isDefined);

  const userLabelBySlackUserId = await runWithTimeout({
    operation: resolveSlackMentionLabels({
      slackUserIds: [...new Set([...mentionedUserIds, ...authorSlackUserIds])],
      client,
      slackClient,
      assistantBotUserId,
    }).catch((error) => {
      console.warn(
        `[slack] failed to resolve mentioned Slack users, the agent sees raw mention tokens: ${error instanceof Error ? error.message : String(error)}`,
      );

      return new Map<string, SlackMentionLabel>();
    }),
    timeoutMs: MENTION_RESOLUTION_TIMEOUT_MS,
    buildTimeoutValue: () => new Map<string, SlackMentionLabel>(),
  });

  const rewrite = (text: string) =>
    rewriteSlackMentions({ text, userLabelBySlackUserId });

  return {
    requestText: rewrite(requestText),
    conversationMessages: splitMessages.map(
      ({ message, authorSlackUserId, body }) => ({
        ...message,
        content: isDefined(authorSlackUserId)
          ? `${formatAuthorPrefix({
              authorSlackUserId,
              authorLabel: userLabelBySlackUserId.get(authorSlackUserId),
            })}${rewrite(body)}`
          : rewrite(body),
      }),
    ),
    hasMentionedUsers: mentionedUserIds.some((slackUserId) => {
      const mentionLabel = userLabelBySlackUserId.get(slackUserId);

      return (
        isDefined(mentionLabel) &&
        mentionLabel.label !== SLACK_ASSISTANT_MENTION_LABEL
      );
    }),
  };
};
