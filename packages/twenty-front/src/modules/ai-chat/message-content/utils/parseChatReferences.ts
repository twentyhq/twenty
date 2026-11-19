import { CHAT_REFERENCE_REGEX } from '@/ai-chat/message-content/constants/ChatReferenceRegex';
import { type ChatReferenceMatch } from '@/ai-chat/message-content/types/ChatReferenceMatch';
import { parseChatReferenceBody } from '@/ai-chat/message-content/utils/parseChatReferenceBody';
import { isDefined } from 'twenty-shared/utils';

export const parseChatReferences = (text: string): ChatReferenceMatch[] => {
  if (!text.includes('[[')) {
    return [];
  }

  return [...text.matchAll(CHAT_REFERENCE_REGEX)].flatMap((match) => {
    const reference = parseChatReferenceBody(match[1]);

    return isDefined(reference)
      ? [{ ...reference, fullMatch: match[0], index: match.index }]
      : [];
  });
};
