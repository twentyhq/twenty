import { CHAT_REFERENCE_REGEX } from '@/ai/constants/ChatReferenceRegex';
import { type ChatReferenceMatch } from '@/ai/types/ChatReferenceMatch';
import { parseChatReferenceBody } from '@/ai/utils/parseChatReferenceBody';
import { isDefined } from 'twenty-shared/utils';

export const parseChatReferences = (text: string): ChatReferenceMatch[] => {
  if (!text.includes('[[')) {
    return [];
  }

  return [...text.matchAll(CHAT_REFERENCE_REGEX)].flatMap((match) => {
    const [fullMatch, body] = match;
    const reference = isDefined(body)
      ? parseChatReferenceBody(body)
      : undefined;

    return isDefined(reference)
      ? [{ ...reference, fullMatch, index: match.index }]
      : [];
  });
};
