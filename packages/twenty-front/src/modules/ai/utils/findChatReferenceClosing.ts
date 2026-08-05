import { ANY_CHAT_REFERENCE_CLOSE_TAG_REGEX } from '@/ai/constants/AnyChatReferenceCloseTagRegex';
import { type ChatReferenceClosing } from '@/ai/types/ChatReferenceClosing';
import { type ChatReferenceKind } from '@/ai/types/ChatReferenceKind';
import { getChatReferenceCloseTag } from '@/ai/utils/getChatReferenceCloseTag';
import { isDefined } from 'twenty-shared/utils';

const LEGACY_REFERENCE_CLOSE_TAG = ']]';

export const findChatReferenceClosing = ({
  displayNameWindow,
  kind,
}: {
  displayNameWindow: string;
  kind: ChatReferenceKind;
}): ChatReferenceClosing | undefined => {
  const closeTag = getChatReferenceCloseTag(kind);
  const closeTagIndex = displayNameWindow.indexOf(closeTag);

  if (closeTagIndex !== -1) {
    return { index: closeTagIndex, length: closeTag.length };
  }

  const foreignCloseTagMatch =
    ANY_CHAT_REFERENCE_CLOSE_TAG_REGEX.exec(displayNameWindow);
  const legacySearchSpace = isDefined(foreignCloseTagMatch)
    ? displayNameWindow.slice(0, foreignCloseTagMatch.index)
    : displayNameWindow;
  const legacyCloseIndex = legacySearchSpace.lastIndexOf(
    LEGACY_REFERENCE_CLOSE_TAG,
  );

  if (legacyCloseIndex === -1) {
    return undefined;
  }

  return {
    index: legacyCloseIndex,
    length: LEGACY_REFERENCE_CLOSE_TAG.length,
  };
};
