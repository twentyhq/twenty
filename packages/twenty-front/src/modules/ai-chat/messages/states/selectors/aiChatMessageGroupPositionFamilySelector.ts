import { AI_CHAT_UNGROUPED_MESSAGE_POSITION } from '@/ai-chat/messages/constants/AiChatUngroupedMessagePosition';
import { aiChatMessageGroupPositionsFamilySelector } from '@/ai-chat/messages/states/selectors/aiChatMessageGroupPositionsFamilySelector';
import { type AiChatMessageGroupPosition } from '@/ai-chat/messages/types/AiChatMessageGroupPosition';
import { createAtomFamilySelector } from '@/ui/utilities/state/jotai/utils/createAtomFamilySelector';

export const aiChatMessageGroupPositionFamilySelector =
  createAtomFamilySelector<
    AiChatMessageGroupPosition,
    { threadId: string; messageId: string }
  >({
    key: 'aiChatMessageGroupPositionFamilySelector',
    get:
      ({ threadId, messageId }) =>
      ({ get }) =>
        get(aiChatMessageGroupPositionsFamilySelector, threadId).get(
          messageId,
        ) ?? AI_CHAT_UNGROUPED_MESSAGE_POSITION,
    areEqual: (previous, next) =>
      previous.isGroupedWithPrevious === next.isGroupedWithPrevious &&
      previous.isGroupedWithNext === next.isGroupedWithNext &&
      previous.isTimeSharedWithNext === next.isTimeSharedWithNext &&
      previous.isFirstOfDay === next.isFirstOfDay &&
      previous.isFollowedByNewDay === next.isFollowedByNewDay,
  });
