import { CHAT_REFERENCE_BODY_PATTERN } from 'twenty-shared/ai';

export const CHAT_REFERENCE_REGEX = new RegExp(
  `\\[\\[(${CHAT_REFERENCE_BODY_PATTERN})\\]\\]`,
  'g',
);
