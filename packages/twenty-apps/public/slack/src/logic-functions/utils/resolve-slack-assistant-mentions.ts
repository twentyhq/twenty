import { type WebClient } from '@slack/web-api';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import { SLACK_ASSISTANT_MENTION_LABEL } from 'src/logic-functions/constants/slack-assistant-mention-label';
import { type SlackAssistantAgentMessage } from 'src/logic-functions/types/slack-assistant-agent-message.type';
import { collectSlackMentionedUserIds } from 'src/logic-functions/utils/collect-slack-mentioned-user-ids';
import { runWithTimeout } from 'src/logic-functions/utils/run-with-timeout';
import { resolveSlackMentionLabels } from 'src/logic-functions/utils/resolve-slack-mention-labels';
import { rewriteSlackMentions } from 'src/logic-functions/utils/rewrite-slack-mentions';

const MENTION_RESOLUTION_TIMEOUT_MS = 5_000;

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

  const userLabelBySlackUserId = await runWithTimeout({
    operation: resolveSlackMentionLabels({
      slackUserIds,
      client,
      slackClient,
      assistantBotUserId,
    }).catch((error) => {
      console.warn(
        `[slack] failed to resolve mentioned Slack users, the agent sees raw mention tokens: ${error instanceof Error ? error.message : String(error)}`,
      );

      return new Map<string, string>();
    }),
    timeoutMs: MENTION_RESOLUTION_TIMEOUT_MS,
    buildTimeoutValue: () => new Map<string, string>(),
  });

  const rewrite = (text: string) =>
    rewriteSlackMentions({ text, userLabelBySlackUserId });

  return {
    requestText: rewrite(requestText),
    conversationMessages: conversationMessages.map((message) => ({
      ...message,
      content: rewrite(message.content),
    })),
    hasMentionedUsers: [...userLabelBySlackUserId.values()].some(
      (label) => label !== SLACK_ASSISTANT_MENTION_LABEL,
    ),
  };
};
