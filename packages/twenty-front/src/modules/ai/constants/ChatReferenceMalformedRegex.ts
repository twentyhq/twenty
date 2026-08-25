import { CHAT_REFERENCE_LABEL_PATTERN } from '@/ai/constants/ChatReferenceLabelPattern';

export const CHAT_REFERENCE_MALFORMED_REGEX = new RegExp(
  `\\[\\[(?:record|object|field|view):(${CHAT_REFERENCE_LABEL_PATTERN})\\]\\]`,
  'g',
);
