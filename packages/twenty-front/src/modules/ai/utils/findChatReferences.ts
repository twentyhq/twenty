import { CHAT_REFERENCE_REGEX } from '@/ai/constants/ChatReferenceRegex';
import { type ChatReferenceMatch } from '@/ai/types/ChatReferenceMatch';
import { getChatReferenceMatchFromRegexMatch } from '@/ai/utils/getChatReferenceMatchFromRegexMatch';

export const findChatReferences = (text: string): ChatReferenceMatch[] => {
  if (!text.includes('[[')) {
    return [];
  }

  return [...text.matchAll(CHAT_REFERENCE_REGEX)].map((match) =>
    getChatReferenceMatchFromRegexMatch(match),
  );
};
