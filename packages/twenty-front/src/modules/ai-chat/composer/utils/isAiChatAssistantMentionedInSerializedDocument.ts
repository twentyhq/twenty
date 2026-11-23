import { AGENT_CHAT_ASSISTANT_MENTION_OBJECT_NAME_SINGULAR } from 'twenty-shared/ai';

import { getAiChatMentionNodes } from '@/ai-chat/composer/utils/getAiChatMentionNodes';

export const isAiChatAssistantMentionedInSerializedDocument = (
  serializedDocument: string,
): boolean =>
  getAiChatMentionNodes(serializedDocument).some(
    ({ attrs: attributes }) =>
      attributes?.objectNameSingular ===
      AGENT_CHAT_ASSISTANT_MENTION_OBJECT_NAME_SINGULAR,
  );
