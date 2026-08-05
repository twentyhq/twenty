import { CHAT_REFERENCE_START_REGEX } from '@/ai/constants/ChatReferenceStartRegex';
import { type ChatReferenceMatch } from '@/ai/types/ChatReferenceMatch';
import { type ChatReferenceStart } from '@/ai/types/ChatReferenceStart';
import { findChatReferenceClosing } from '@/ai/utils/findChatReferenceClosing';
import { getChatReferenceStartFromMatch } from '@/ai/utils/getChatReferenceStartFromMatch';
import { getSurplusCloseBracketLength } from '@/ai/utils/getSurplusCloseBracketLength';
import { isDefined } from 'twenty-shared/utils';

export const findChatReferences = (text: string): ChatReferenceMatch[] => {
  const starts: ChatReferenceStart[] = [];

  CHAT_REFERENCE_START_REGEX.lastIndex = 0;

  let startMatch;

  while ((startMatch = CHAT_REFERENCE_START_REGEX.exec(text)) !== null) {
    starts.push(getChatReferenceStartFromMatch(startMatch));
  }

  return starts.flatMap((start, startIndex) => {
    const displayNameStart = start.index + start.prefixLength;
    const windowEnd =
      startIndex + 1 < starts.length
        ? starts[startIndex + 1].index
        : text.length;
    const displayNameWindow = text.slice(displayNameStart, windowEnd);

    const closing = findChatReferenceClosing({
      displayNameWindow,
      kind: start.identity.kind,
    });

    if (!isDefined(closing)) {
      return [];
    }

    const closingEnd = closing.index + closing.length;
    const surplusCloseBracketLength = getSurplusCloseBracketLength({
      textAfterClosing: displayNameWindow.slice(closingEnd),
      openBracketLength: start.openBracketLength,
    });

    return [
      {
        ...start.identity,
        fullMatch: text.slice(
          start.index,
          displayNameStart + closingEnd + surplusCloseBracketLength,
        ),
        index: start.index,
        displayName: displayNameWindow.slice(0, closing.index),
      },
    ];
  });
};
