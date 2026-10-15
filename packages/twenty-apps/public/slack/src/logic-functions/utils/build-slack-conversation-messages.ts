import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-sdk/utils';

import { SLACK_ASSISTANT_REQUEST_STATUS } from 'src/logic-functions/constants/slack-assistant-request-status';
import { type SlackAssistantAgentMessage } from 'src/logic-functions/types/slack-assistant-agent-message.type';
import { type SlackAssistantRequestOutcome } from 'src/logic-functions/types/slack-assistant-request-outcome.type';
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

const isAnsweredRequest = ({
  status,
  responseText,
}: SlackAssistantRequestOutcome): boolean =>
  status === SLACK_ASSISTANT_REQUEST_STATUS.DONE ||
  (status === SLACK_ASSISTANT_REQUEST_STATUS.FAILED &&
    isNonEmptyString(responseText));

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
  requestOutcomeByMessageTimestamp,
}: {
  messages: ReadonlyArray<SlackThreadMessage>;
  assistantBotUserId: string | undefined;
  requestOutcomeByMessageTimestamp: ReadonlyMap<
    string,
    SlackAssistantRequestOutcome
  >;
}): SlackAssistantAgentMessage[] => {
  const getRequestOutcome = (
    message: SlackThreadMessage,
  ): SlackAssistantRequestOutcome | undefined =>
    isNonEmptyString(message.ts)
      ? requestOutcomeByMessageTimestamp.get(message.ts)
      : undefined;

  const lastAnsweredRequestIndex = messages
    .map((message) => {
      const requestOutcome = getRequestOutcome(message);

      return isDefined(requestOutcome) && isAnsweredRequest(requestOutcome);
    })
    .lastIndexOf(true);

  return messages
    .slice(lastAnsweredRequestIndex + 1)
    .filter((message) => !isOwnBotMessage({ message, assistantBotUserId }))
    .filter((message) => {
      const requestOutcome = getRequestOutcome(message);

      return (
        !isDefined(requestOutcome) ||
        requestOutcome.status === SLACK_ASSISTANT_REQUEST_STATUS.FAILED ||
        requestOutcome.status === SLACK_ASSISTANT_REQUEST_STATUS.DECLINED
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
