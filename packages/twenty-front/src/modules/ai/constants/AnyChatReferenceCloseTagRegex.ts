import { CHAT_REFERENCE_KINDS } from '@/ai/constants/ChatReferenceKinds';

export const ANY_CHAT_REFERENCE_CLOSE_TAG_REGEX = new RegExp(
  `\\[\\[/(?:${CHAT_REFERENCE_KINDS.join('|')})\\]\\]`,
);
