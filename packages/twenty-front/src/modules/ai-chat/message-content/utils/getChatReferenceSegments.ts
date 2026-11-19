import { type ChatReferenceMatch } from '@/ai-chat/message-content/types/ChatReferenceMatch';
import { parseChatReferences } from '@/ai-chat/message-content/utils/parseChatReferences';
import { replaceMalformedChatReferencesWithDisplayName } from '@/ai-chat/message-content/utils/replaceMalformedChatReferencesWithDisplayName';

export const getChatReferenceSegments = (
  text: string,
): Array<string | ChatReferenceMatch> => {
  const references = parseChatReferences(text);
  const segments: Array<string | ChatReferenceMatch> = [];
  let lastIndex = 0;

  for (const reference of references) {
    if (reference.index > lastIndex) {
      segments.push(
        replaceMalformedChatReferencesWithDisplayName(
          text.slice(lastIndex, reference.index),
        ),
      );
    }

    segments.push(reference);
    lastIndex = reference.index + reference.fullMatch.length;
  }

  if (lastIndex < text.length) {
    segments.push(
      replaceMalformedChatReferencesWithDisplayName(text.slice(lastIndex)),
    );
  }

  return segments;
};
