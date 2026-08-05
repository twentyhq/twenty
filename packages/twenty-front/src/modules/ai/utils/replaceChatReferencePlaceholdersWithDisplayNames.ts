import { CHAT_REFERENCE_PLACEHOLDER_REGEX } from '@/ai/constants/ChatReferencePlaceholderRegex';
import { type ChatReferenceMatch } from '@/ai/types/ChatReferenceMatch';
import { isDefined } from 'twenty-shared/utils';

export const replaceChatReferencePlaceholdersWithDisplayNames = ({
  text,
  references,
}: {
  text: string;
  references: ChatReferenceMatch[];
}): string => {
  if (references.length === 0) {
    return text;
  }

  return text.replace(
    CHAT_REFERENCE_PLACEHOLDER_REGEX,
    (placeholder, index) => {
      const reference = references[Number(index)];

      return isDefined(reference) ? reference.displayName : placeholder;
    },
  );
};
