import { isNonEmptyString } from '@sniptt/guards';

import { getAiChatMentionNodes } from '@/ai-chat/composer/utils/getAiChatMentionNodes';
import { type AiChatConversationTarget } from '@/ai-chat/threads/types/AiChatConversationTarget';

export const getConversationTargetsFromSerializedDocument = (
  serializedDocument: string,
): AiChatConversationTarget[] =>
  getAiChatMentionNodes(serializedDocument).flatMap(({ attrs }) => {
    const objectNameSingular = attrs?.objectNameSingular;
    const recordId = attrs?.recordId;

    if (
      attrs?.isConversationTarget !== true ||
      !isNonEmptyString(objectNameSingular) ||
      !isNonEmptyString(recordId)
    ) {
      return [];
    }

    return [{ objectNameSingular, recordId }];
  });
