import { isNonEmptyString } from '@sniptt/guards';

import { type SlackAssistantAgentMessage } from 'src/logic-functions/types/slack-assistant-agent-message.type';
import { type SlackThreadMessage } from 'src/logic-functions/types/slack-thread-message.type';
import { buildSlackSharedFilesDescription } from 'src/logic-functions/utils/build-slack-shared-files-description';
import { getSlackMessageFileNames } from 'src/logic-functions/utils/get-slack-message-file-names';
import { selectSlackConversationMessages } from 'src/logic-functions/utils/select-slack-conversation-messages';
import { stripSlackAssistantAnswerFooter } from 'src/logic-functions/utils/strip-slack-assistant-answer-footer';

const joinSlackMessageContent = ({
  text,
  filesDescription,
}: {
  text: string;
  filesDescription: string;
}): string => {
  if (!isNonEmptyString(filesDescription)) {
    return text;
  }

  const bracketedDescription = `[${filesDescription}]`;

  return isNonEmptyString(text)
    ? `${text}\n${bracketedDescription}`
    : bracketedDescription;
};

export const buildSlackConversationMessages = ({
  messages,
  assistantBotUserId,
  excludeMessageTimestamps = [],
}: {
  messages: ReadonlyArray<SlackThreadMessage>;
  assistantBotUserId: string | undefined;
  excludeMessageTimestamps?: string[];
}): SlackAssistantAgentMessage[] => {
  const agentMessages = selectSlackConversationMessages({
    messages,
    excludeMessageTimestamps,
  }).map((message): SlackAssistantAgentMessage => {
    const filesDescription = buildSlackSharedFilesDescription(
      getSlackMessageFileNames(message.files),
    );

    if (isNonEmptyString(message.user) && message.user === assistantBotUserId) {
      return {
        role: 'assistant',
        content: joinSlackMessageContent({
          text: stripSlackAssistantAnswerFooter(message.text ?? ''),
          filesDescription,
        }),
      };
    }

    const author = isNonEmptyString(message.bot_id)
      ? `bot ${message.bot_id}`
      : `<@${message.user ?? 'unknown'}>`;

    return {
      role: 'user',
      content: `${author}: ${joinSlackMessageContent({ text: message.text ?? '', filesDescription })}`,
    };
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
