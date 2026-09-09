import { type WebClient } from '@slack/web-api';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import { type SlackAssistantAgentMessage } from 'src/logic-functions/types/slack-assistant-agent-message.type';
import {
  ASSISTANT_MENTION_LABEL,
  resolveSlackMentionLabels,
} from 'src/logic-functions/utils/resolve-slack-mention-labels';
import {
  collectSlackMentionedUserIds,
  rewriteSlackMentions,
} from 'src/logic-functions/utils/rewrite-slack-mentions';

// The worker awaits this before the agent starts, so a hung Slack or Core API
// call would otherwise eat into the agent's own budget.
const MENTION_RESOLUTION_TIMEOUT_MS = 5_000;

const raceMentionResolutionTimeout = async (
  labels: Promise<Map<string, string>>,
): Promise<Map<string, string>> => {
  let timeoutTimer: ReturnType<typeof setTimeout> | undefined;

  const timedOutLabels = new Promise<Map<string, string>>((resolve) => {
    timeoutTimer = setTimeout(
      () => resolve(new Map()),
      MENTION_RESOLUTION_TIMEOUT_MS,
    );
  });

  try {
    return await Promise.race([labels, timedOutLabels]);
  } finally {
    clearTimeout(timeoutTimer);
  }
};

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

  const userLabelBySlackUserId = await raceMentionResolutionTimeout(
    resolveSlackMentionLabels({
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
  );

  const rewrite = (text: string) =>
    rewriteSlackMentions({ text, userLabelBySlackUserId });

  return {
    requestText: rewrite(requestText),
    conversationMessages: conversationMessages.map((message) => ({
      ...message,
      content: rewrite(message.content),
    })),
    // Reading the labels rather than the ids keeps the glossary tied to what
    // the prompt actually says, so a resolution that timed out never explains
    // labels the agent cannot see.
    hasMentionedUsers: [...userLabelBySlackUserId.values()].some(
      (label) => label !== ASSISTANT_MENTION_LABEL,
    ),
  };
};
