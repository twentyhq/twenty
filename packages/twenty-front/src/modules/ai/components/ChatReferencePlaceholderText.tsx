import { ChatReferenceText } from '@/ai/components/ChatReferenceText';
import { CHAT_REFERENCE_PLACEHOLDER_REGEX } from '@/ai/constants/ChatReferencePlaceholderRegex';
import { ChatReferencesContext } from '@/ai/contexts/ChatReferencesContext';
import { type ChatReferenceTextMatch } from '@/ai/types/ChatReferenceTextMatch';
import { useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';

type ChatReferencePlaceholderTextProps = {
  text: string;
};

export const ChatReferencePlaceholderText = ({
  text,
}: ChatReferencePlaceholderTextProps) => {
  const references = useContext(ChatReferencesContext);

  const matches: ChatReferenceTextMatch[] = [];

  for (const placeholderMatch of text.matchAll(
    CHAT_REFERENCE_PLACEHOLDER_REGEX,
  )) {
    const reference = references[Number(placeholderMatch[1])];

    if (isDefined(reference)) {
      matches.push({
        index: placeholderMatch.index,
        length: placeholderMatch[0].length,
        reference,
      });
    }
  }

  return <ChatReferenceText text={text} matches={matches} />;
};
