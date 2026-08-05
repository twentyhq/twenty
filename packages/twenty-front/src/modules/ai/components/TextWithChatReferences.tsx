import { ChatReferenceText } from '@/ai/components/ChatReferenceText';
import { findChatReferences } from '@/ai/utils/findChatReferences';

type TextWithChatReferencesProps = {
  text: string;
};

export const TextWithChatReferences = ({
  text,
}: TextWithChatReferencesProps) => {
  const matches = findChatReferences(text).map((reference) => ({
    index: reference.index,
    length: reference.fullMatch.length,
    reference,
  }));

  return <ChatReferenceText text={text} matches={matches} />;
};
