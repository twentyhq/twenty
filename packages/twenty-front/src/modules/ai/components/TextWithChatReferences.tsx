import { ChatReferenceChip } from '@/ai/components/ChatReferenceChip';
import { findChatReferences } from '@/ai/utils/findChatReferences';
import { type ReactNode } from 'react';

type TextWithChatReferencesProps = {
  text: string;
};

export const TextWithChatReferences = ({
  text,
}: TextWithChatReferencesProps) => {
  const references = findChatReferences(text);

  if (references.length === 0) {
    return <>{text}</>;
  }

  const parts: ReactNode[] = [];
  let lastIndex = 0;

  for (const reference of references) {
    if (reference.index > lastIndex) {
      parts.push(text.slice(lastIndex, reference.index));
    }

    parts.push(
      <ChatReferenceChip key={reference.index} reference={reference} />,
    );

    lastIndex = reference.index + reference.fullMatch.length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return <>{parts}</>;
};
