import {
  parseRecordReference,
  RECORD_REFERENCE_REGEX,
  RecordLink,
} from '@/ai/components/RecordLink';
import { type ReactNode } from 'react';
import { isDefined } from 'twenty-shared/utils';

type TextWithRecordLinksProps = {
  text: string;
};

export const TextWithRecordLinks = ({ text }: TextWithRecordLinksProps) => {
  const parts: ReactNode[] = [];
  let lastIndex = 0;

  RECORD_REFERENCE_REGEX.lastIndex = 0;

  let match;

  while ((match = RECORD_REFERENCE_REGEX.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    const parsed = parseRecordReference(match[0]);

    if (isDefined(parsed)) {
      parts.push(
        <RecordLink
          key={match.index}
          objectNameSingular={parsed.objectNameSingular}
          recordId={parsed.recordId}
          displayName={parsed.displayName}
        />,
      );
    }

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return <>{parts}</>;
};
