import { RecordLink } from '@/ai/components/RecordLink';
import { findRecordReferences } from '@/ai/utils/findRecordReferences';
import { type ReactNode } from 'react';

type TextWithRecordLinksProps = {
  text: string;
};

export const TextWithRecordLinks = ({ text }: TextWithRecordLinksProps) => {
  const references = findRecordReferences(text);

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
      <RecordLink
        key={reference.index}
        objectNameSingular={reference.objectNameSingular}
        recordId={reference.recordId}
        displayName={reference.displayName}
      />,
    );

    lastIndex = reference.index + reference.fullMatch.length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return <>{parts}</>;
};
