import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-sdk/utils';

import { SLACK_ASSISTANT_REQUEST_STATUS } from 'src/logic-functions/constants/slack-assistant-request-status';
import { type SlackAssistantAgentMessage } from 'src/logic-functions/types/slack-assistant-agent-message.type';
import { type SlackAssistantRequestStatus } from 'src/logic-functions/types/slack-assistant-request-status.type';
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

const isOwnBotMessage = ({
  message,
  assistantBotUserId,
}: {
  message: SlackThreadMessage;
  assistantBotUserId: string | undefined;
}): boolean =>
  isNonEmptyString(assistantBotUserId)
    ? message.user === assistantBotUserId
    : isNonEmptyString(message.bot_id);

export const buildSlackConversationMessages = ({
  messages,
  assistantBotUserId,
  requestStatusByMessageTimestamp,
}: {
  messages: ReadonlyArray<SlackThreadMessage>;
  assistantBotUserId: string | undefined;
  requestStatusByMessageTimestamp: ReadonlyMap<
    string,
    SlackAssistantRequestStatus
  >;
}): SlackAssistantAgentMessage[] => {
  const getRequestStatus = (
    message: SlackThreadMessage,
  ): SlackAssistantRequestStatus | undefined =>
    isNonEmptyString(message.ts)
      ? requestStatusByMessageTimestamp.get(message.ts)
      : undefined;

  const lastAnsweredRequestIndex = messages
    .map(getRequestStatus)
    .lastIndexOf(SLACK_ASSISTANT_REQUEST_STATUS.DONE);

  return messages
    .slice(lastAnsweredRequestIndex + 1)
    .filter((message) => !isOwnBotMessage({ message, assistantBotUserId }))
    .filter((message) => {
      const requestStatus = getRequestStatus(message);

      return (
        !isDefined(requestStatus) ||
        requestStatus === SLACK_ASSISTANT_REQUEST_STATUS.FAILED
      );
    })
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
