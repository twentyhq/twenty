import { CHAT_REFERENCE_PLACEHOLDER_CLOSE_CHARACTER } from '@/ai/constants/ChatReferencePlaceholderCloseCharacter';
import { CHAT_REFERENCE_PLACEHOLDER_OPEN_CHARACTER } from '@/ai/constants/ChatReferencePlaceholderOpenCharacter';

export const getChatReferencePlaceholder = (referenceIndex: number): string =>
  `${CHAT_REFERENCE_PLACEHOLDER_OPEN_CHARACTER}${referenceIndex}${CHAT_REFERENCE_PLACEHOLDER_CLOSE_CHARACTER}`;
