import { isNonEmptyString } from '@sniptt/guards';

import { type SlackThreadMessage } from 'src/logic-functions/types/slack-thread-message.type';

const CONTEXT_MESSAGE_LIMIT = 15;

// Only this app's own replies are labelled `assistant`. Any other bot in the
// thread is a participant like anyone else: labelling every `bot_id` as the
// assistant would let a third-party Slack app write what reads as the
// assistant's own prior turns, and the agent now acts with a member's
// permissions. A bot user id we could not resolve labels nothing as assistant,
// which loses a little fidelity and trusts nothing.
//
// A thread reads oldest first, so keeping the tail keeps the most recent turns.
export const formatSlackConversationContext = ({
  messages,
  botUserId,
  excludeMessageTimestamps = [],
}: {
  messages: ReadonlyArray<SlackThreadMessage>;
  botUserId: string | undefined;
  excludeMessageTimestamps?: string[];
}): string => {
  const excludedTimestamps = new Set(
    excludeMessageTimestamps.filter(isNonEmptyString),
  );

  return messages
    .filter((message) => {
      if (isNonEmptyString(message.ts) && excludedTimestamps.has(message.ts)) {
        return false;
      }

      return isNonEmptyString(message.text);
    })
    .slice(-CONTEXT_MESSAGE_LIMIT)
    .map((message) => {
      const isOwnReply =
        isNonEmptyString(botUserId) && message.user === botUserId;

      const author = isOwnReply
        ? 'assistant'
        : `<@${message.user ?? 'unknown'}>`;

      return `${author}: ${message.text}`;
    })
    .join('\n');
};
