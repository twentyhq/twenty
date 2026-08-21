import { type ChatReferenceMatch } from '@/ai/types/ChatReferenceMatch';
import { findChatReferences } from '@/ai/utils/findChatReferences';

export const getChatReferenceSegments = (
  text: string,
): Array<string | ChatReferenceMatch> => {
  const references = findChatReferences(text);
  const segments: Array<string | ChatReferenceMatch> = [];
  let lastIndex = 0;

  for (const reference of references) {
    if (reference.index > lastIndex) {
      segments.push(text.slice(lastIndex, reference.index));
    }

    segments.push(reference);
    lastIndex = reference.index + reference.fullMatch.length;
  }

  if (lastIndex < text.length) {
    segments.push(text.slice(lastIndex));
  }

  return segments;
};
