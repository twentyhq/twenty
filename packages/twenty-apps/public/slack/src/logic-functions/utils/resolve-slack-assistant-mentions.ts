import { type WebClient } from '@slack/web-api';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import { type SlackAssistantAgentMessage } from 'src/logic-functions/types/slack-assistant-agent-message.type';
import { resolveSlackMentionLabels } from 'src/logic-functions/utils/resolve-slack-mention-labels';
import {
  collectSlackMentionedUserIds,
  rewriteSlackMentions,
} from 'src/logic-functions/utils/rewrite-slack-mentions';

type ResolvedSlackAssistantMentions = {
  requestText: string;
  conversationMessages: SlackAssistantAgentMessage[];
  hasMentionedUsers: boolean;
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
  const texts = [
    requestText,
    ...conversationMessages.map((message) => message.content),
  ];

  const slackUserIds = collectSlackMentionedUserIds(texts);

  const userLabelBySlackUserId = await resolveSlackMentionLabels({
    slackUserIds,
    client,
    slackClient,
    assistantBotUserId,
  }).catch((error) => {
    console.warn(
      `[slack] failed to resolve mentioned Slack users, the agent sees raw mention tokens: ${error instanceof Error ? error.message : String(error)}`,
    );

    return new Map<string, string>();
  });

  const rewrite = (text: string) =>
    rewriteSlackMentions({ text, userLabelBySlackUserId });

  return {
    requestText: rewrite(requestText),
    conversationMessages: conversationMessages.map((message) => ({
      ...message,
      content: rewrite(message.content),
    })),
    hasMentionedUsers: slackUserIds.some(
      (slackUserId) => slackUserId !== assistantBotUserId,
    ),
  };
};
