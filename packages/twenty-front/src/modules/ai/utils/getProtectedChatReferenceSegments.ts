import { PROTECTED_CHAT_REFERENCE_MARKER } from '@/ai/constants/ProtectedChatReferenceMarker';
import { type ChatReferenceMatch } from '@/ai/types/ChatReferenceMatch';
import { parseChatReferences } from '@/ai/utils/parseChatReferences';
import { isDefined } from 'twenty-shared/utils';

export const getProtectedChatReferenceSegments = (
  text: string,
): Array<string | ChatReferenceMatch> => {
  const [leadingText, ...markedTexts] = text.split(
    PROTECTED_CHAT_REFERENCE_MARKER,
  );
  const segments: Array<string | ChatReferenceMatch> = [leadingText];
  let markedTextIndex = leadingText.length;

  for (const markedText of markedTexts) {
    markedTextIndex += PROTECTED_CHAT_REFERENCE_MARKER.length;

    const leadingReference = parseChatReferences(markedText).find(
      (reference) => reference.index === 0,
    );

    if (isDefined(leadingReference)) {
      segments.push(
        { ...leadingReference, index: markedTextIndex },
        markedText.slice(leadingReference.fullMatch.length),
      );
    } else {
      segments.push(markedText);
    }

    markedTextIndex += markedText.length;
  }

  return segments.filter((segment) => segment !== '');
};
