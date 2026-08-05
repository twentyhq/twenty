import { CHAT_REFERENCE_PLACEHOLDER_CLOSE_CHARACTER } from '@/ai/constants/ChatReferencePlaceholderCloseCharacter';
import { CHAT_REFERENCE_PLACEHOLDER_OPEN_CHARACTER } from '@/ai/constants/ChatReferencePlaceholderOpenCharacter';

export const CHAT_REFERENCE_PLACEHOLDER_REGEX = new RegExp(
  `${CHAT_REFERENCE_PLACEHOLDER_OPEN_CHARACTER}(\\d+)${CHAT_REFERENCE_PLACEHOLDER_CLOSE_CHARACTER}`,
  'g',
);
