import { ChatReferenceChip } from '@/ai/components/ChatReferenceChip';
import { type ChatReferenceTextMatch } from '@/ai/types/ChatReferenceTextMatch';
import { type ReactNode } from 'react';

type ChatReferenceTextProps = {
  text: string;
  matches: ChatReferenceTextMatch[];
};

export const ChatReferenceText = ({
  text,
  matches,
}: ChatReferenceTextProps) => {
  if (matches.length === 0) {
    return <>{text}</>;
  }

  const parts: ReactNode[] = [];
  let lastIndex = 0;

  for (const match of matches) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    parts.push(
      <ChatReferenceChip key={match.index} reference={match.reference} />,
    );

    lastIndex = match.index + match.length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return <>{parts}</>;
};
