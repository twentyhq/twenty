import { CHAT_REFERENCE_LABEL_PATTERN } from '@/ai/constants/ChatReferenceLabelPattern';

export const CHAT_REFERENCE_MALFORMED_REGEX = new RegExp(
  `\\[\\[(?:record|records|object|field|view|role|app):(${CHAT_REFERENCE_LABEL_PATTERN})\\]\\]`,
  'g',
);
