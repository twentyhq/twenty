import { aiChatFirstUnreadMessageIdFamilySelector } from '@/ai-chat/messages/states/selectors/aiChatFirstUnreadMessageIdFamilySelector';
import { type AiChatMessageGroupPosition } from '@/ai-chat/messages/types/AiChatMessageGroupPosition';
import { areAiChatMessagesGrouped } from '@/ai-chat/messages/utils/areAiChatMessagesGrouped';
import { isAiChatMessageTimeSharedWithNext } from '@/ai-chat/messages/utils/isAiChatMessageTimeSharedWithNext';
import { isSilentAiChatMessage } from '@/ai-chat/messages/utils/isSilentAiChatMessage';
import { aiChatThreadDisplayedMessagesFamilyState } from '@/ai-chat/states/display/aiChatThreadDisplayedMessagesFamilyState';
import { createAtomFamilySelector } from '@/ui/utilities/state/jotai/utils/createAtomFamilySelector';

export const aiChatMessageGroupPositionsFamilySelector =
  createAtomFamilySelector<Map<string, AiChatMessageGroupPosition>, string>({
    key: 'aiChatMessageGroupPositionsFamilySelector',
    get:
      (threadId) =>
      ({ get }) => {
        const messages = get(aiChatThreadDisplayedMessagesFamilyState, {
          threadId,
        }).filter((message) => !isSilentAiChatMessage(message));
        const firstUnreadMessageId = get(
          aiChatFirstUnreadMessageIdFamilySelector,
          threadId,
        );
        const isGroupedWithPreviousByIndex = messages.map(
          (message, index) =>
            index > 0 &&
            message.id !== firstUnreadMessageId &&
            areAiChatMessagesGrouped({
              previousMessage: messages[index - 1],
              message,
            }),
        );

        return new Map(
          messages.map((message, index) => {
            const isGroupedWithNext =
              isGroupedWithPreviousByIndex[index + 1] ?? false;

            return [
              message.id,
              {
                isGroupedWithPrevious: isGroupedWithPreviousByIndex[index],
                isGroupedWithNext,
                isTimeSharedWithNext:
                  isGroupedWithNext &&
                  isAiChatMessageTimeSharedWithNext({
                    message,
                    nextMessage: messages[index + 1],
                  }),
              },
            ];
          }),
        );
      },
  });
