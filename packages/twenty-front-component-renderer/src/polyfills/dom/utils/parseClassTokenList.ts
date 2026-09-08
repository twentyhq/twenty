import { isNonEmptyString } from '@sniptt/guards';

import { ASCII_WHITESPACE_REGEX } from '@/polyfills/dom/constants/AsciiWhitespaceRegex';

export const parseClassTokenList = (classAttributeValue: string): string[] => [
  ...new Set(
    classAttributeValue.split(ASCII_WHITESPACE_REGEX).filter(isNonEmptyString),
  ),
];
