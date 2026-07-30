import { escapeMarkdownForChatReference } from '@/ai/utils/escapeMarkdownForChatReference';
import { findChatReferences } from '@/ai/utils/findChatReferences';
import { formatChatReference } from '@/ai/utils/formatChatReference';

export const protectChatReferencesForMarkdown = (text: string): string => {
  const references = findChatReferences(text);

  if (references.length === 0) {
    return text;
  }

  const parts: string[] = [];
  let lastIndex = 0;

  for (const reference of references) {
    parts.push(text.slice(lastIndex, reference.index));
    parts.push(
      formatChatReference({
        ...reference,
        displayName: escapeMarkdownForChatReference(reference.displayName),
      }),
    );

    lastIndex = reference.index + reference.fullMatch.length;
  }

  parts.push(text.slice(lastIndex));

  return parts.join('');
};
