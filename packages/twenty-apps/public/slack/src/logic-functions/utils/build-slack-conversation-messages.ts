import { isNonEmptyString } from '@sniptt/guards';

import { type SlackAssistantAgentMessage } from 'src/logic-functions/types/slack-assistant-agent-message.type';
import { type SlackThreadMessage } from 'src/logic-functions/types/slack-thread-message.type';
import { buildSlackSharedFilesDescription } from 'src/logic-functions/utils/build-slack-shared-files-description';
import { getSlackMessageFileNames } from 'src/logic-functions/utils/get-slack-message-file-names';

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

const findLastAssistantReplyIndex = ({
  messages,
  assistantBotUserId,
}: {
  messages: ReadonlyArray<SlackThreadMessage>;
  assistantBotUserId: string;
}): number => {
  for (let index = messages.length - 1; index >= 0; index--) {
    if (messages[index].user === assistantBotUserId) {
      return index;
    }
  }

  return -1;
};

// The run is keyed to the Slack thread, so the server already holds every turn
// up to the assistant's last reply; only what members posted after it is new
export const buildSlackConversationMessages = ({
  messages,
  assistantBotUserId,
}: {
  messages: ReadonlyArray<SlackThreadMessage>;
  assistantBotUserId: string | undefined;
}): SlackAssistantAgentMessage[] => {
  // without the bot's id the last reply cannot be found, and replaying the
  // whole thread would duplicate the turns the server holds
  if (!isNonEmptyString(assistantBotUserId)) {
    return [];
  }

  const lastAssistantReplyIndex = findLastAssistantReplyIndex({
    messages,
    assistantBotUserId,
  });

  return messages
    .slice(lastAssistantReplyIndex + 1)
    .map((message): SlackAssistantAgentMessage => {
      const author = isNonEmptyString(message.bot_id)
        ? `bot ${message.bot_id}`
        : `<@${message.user ?? 'unknown'}>`;
      const filesDescription = buildSlackSharedFilesDescription(
        getSlackMessageFileNames(message.files),
      );

      return {
        role: 'user',
        content: `${author}: ${joinSlackMessageContent({ text: message.text ?? '', filesDescription })}`,
      };
    });
};
