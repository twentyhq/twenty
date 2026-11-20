import { isDefined } from 'twenty-shared/utils';

import { aiChatFirstUnreadMessageIdFamilySelector } from '@/ai-chat/messages/states/selectors/aiChatFirstUnreadMessageIdFamilySelector';
import { areAiChatMessagesGrouped } from '@/ai-chat/messages/utils/areAiChatMessagesGrouped';
import { isSilentAiChatMessage } from '@/ai-chat/messages/utils/isSilentAiChatMessage';
import { aiChatMessagesFamilyState } from '@/ai-chat/states/aiChatMessagesFamilyState';
import { createAtomFamilySelector } from '@/ui/utilities/state/jotai/utils/createAtomFamilySelector';

type AiChatMessageGroupPosition = {
  isGroupedWithPrevious: boolean;
  isGroupedWithNext: boolean;
};

export const aiChatMessageGroupPositionFamilySelector =
  createAtomFamilySelector<
    AiChatMessageGroupPosition,
    { threadId: string; messageId: string }
  >({
    key: 'aiChatMessageGroupPositionFamilySelector',
    get:
      ({ threadId, messageId }) =>
      ({ get }) => {
        const messages = get(aiChatMessagesFamilyState, { threadId }).filter(
          (message) => !isSilentAiChatMessage(message),
        );
        const firstUnreadMessageId = get(
          aiChatFirstUnreadMessageIdFamilySelector,
          threadId,
        );
        const messageIndex = messages.findIndex(({ id }) => id === messageId);
        const message = messages[messageIndex];
        const previousMessage = messages[messageIndex - 1];
        const nextMessage = messages[messageIndex + 1];

        if (!isDefined(message)) {
          return { isGroupedWithPrevious: false, isGroupedWithNext: false };
        }

        return {
          isGroupedWithPrevious:
            isDefined(previousMessage) &&
            message.id !== firstUnreadMessageId &&
            areAiChatMessagesGrouped({ previousMessage, message }),
          isGroupedWithNext:
            isDefined(nextMessage) &&
            nextMessage.id !== firstUnreadMessageId &&
            areAiChatMessagesGrouped({
              previousMessage: message,
              message: nextMessage,
            }),
        };
      },
    areEqual: (previous, next) =>
      previous.isGroupedWithPrevious === next.isGroupedWithPrevious &&
      previous.isGroupedWithNext === next.isGroupedWithNext,
  });
