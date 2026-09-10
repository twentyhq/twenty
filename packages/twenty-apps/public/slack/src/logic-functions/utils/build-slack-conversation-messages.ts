import { isNonEmptyString } from '@sniptt/guards';

import { type SlackAssistantAgentMessage } from 'src/logic-functions/types/slack-assistant-agent-message.type';
import { type SlackThreadMessage } from 'src/logic-functions/types/slack-thread-message.type';
import { stripSlackAssistantAnswerFooter } from 'src/logic-functions/utils/strip-slack-assistant-answer-footer';

const CONTEXT_MESSAGE_LIMIT = 15;

type SlackThreadMessageWithText = SlackThreadMessage & { text: string };

export const buildSlackConversationMessages = ({
  messages,
  assistantBotUserId,
  excludeMessageTimestamps = [],
}: {
  messages: ReadonlyArray<SlackThreadMessage>;
  assistantBotUserId: string | undefined;
  excludeMessageTimestamps?: string[];
}): SlackAssistantAgentMessage[] => {
  const excludedTimestamps = new Set(
    excludeMessageTimestamps.filter(isNonEmptyString),
  );

  const agentMessages = messages
    .filter((message): message is SlackThreadMessageWithText => {
      if (!isNonEmptyString(message.text)) {
        return false;
      }

      return !(
        isNonEmptyString(message.ts) && excludedTimestamps.has(message.ts)
      );
    })
    .slice(-CONTEXT_MESSAGE_LIMIT)
    .map((message): SlackAssistantAgentMessage => {
      if (
        isNonEmptyString(message.user) &&
        message.user === assistantBotUserId
      ) {
        return {
          role: 'assistant',
          content: stripSlackAssistantAnswerFooter(message.text),
        };
      }

      const author = isNonEmptyString(message.bot_id)
        ? `bot ${message.bot_id}`
        : `<@${message.user ?? 'unknown'}>`;

      return { role: 'user', content: `${author}: ${message.text}` };
    });

  // trimming the window can leave an assistant turn first, which providers
  // reject: a conversation has to open on a user turn
  const firstUserTurnIndex = agentMessages.findIndex(
    (message) => message.role === 'user',
  );

  return firstUserTurnIndex === -1
    ? []
    : agentMessages.slice(firstUserTurnIndex);
};
