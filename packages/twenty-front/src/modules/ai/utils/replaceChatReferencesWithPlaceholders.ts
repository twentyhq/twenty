import { type ChatReferenceMatch } from '@/ai/types/ChatReferenceMatch';
import { findChatReferences } from '@/ai/utils/findChatReferences';
import { getChatReferencePlaceholder } from '@/ai/utils/getChatReferencePlaceholder';

export const replaceChatReferencesWithPlaceholders = (
  text: string,
): { textWithPlaceholders: string; references: ChatReferenceMatch[] } => {
  const references = findChatReferences(text);

  if (references.length === 0) {
    return { textWithPlaceholders: text, references };
  }

  const parts: string[] = [];
  let lastIndex = 0;

  for (const [referenceIndex, reference] of references.entries()) {
    parts.push(text.slice(lastIndex, reference.index));
    parts.push(getChatReferencePlaceholder(referenceIndex));

    lastIndex = reference.index + reference.fullMatch.length;
  }

  parts.push(text.slice(lastIndex));

  return { textWithPlaceholders: parts.join(''), references };
};
