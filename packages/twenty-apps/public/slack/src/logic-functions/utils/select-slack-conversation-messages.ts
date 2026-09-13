import { isNonEmptyArray, isNonEmptyString } from '@sniptt/guards';

import { type SlackThreadMessage } from 'src/logic-functions/types/slack-thread-message.type';

const CONTEXT_MESSAGE_LIMIT = 15;

export const selectSlackConversationMessages = ({
  messages,
  excludeMessageTimestamps = [],
}: {
  messages: ReadonlyArray<SlackThreadMessage>;
  excludeMessageTimestamps?: string[];
}): SlackThreadMessage[] => {
  const excludedTimestamps = new Set(
    excludeMessageTimestamps.filter(isNonEmptyString),
  );

  return messages
    .filter((message) => {
      if (!isNonEmptyString(message.text) && !isNonEmptyArray(message.files)) {
        return false;
      }

      return !(
        isNonEmptyString(message.ts) && excludedTimestamps.has(message.ts)
      );
    })
    .slice(-CONTEXT_MESSAGE_LIMIT);
};
