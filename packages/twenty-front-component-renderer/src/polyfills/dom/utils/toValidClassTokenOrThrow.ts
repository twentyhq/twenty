import { isNonEmptyString } from '@sniptt/guards';

import { ASCII_WHITESPACE_REGEX } from '@/polyfills/dom/constants/AsciiWhitespaceRegex';
import { createDomException } from '@/polyfills/utils/createDomException';

export const toValidClassTokenOrThrow = (token: unknown): string => {
  const tokenAsString = String(token);

  if (!isNonEmptyString(tokenAsString)) {
    throw createDomException(
      'The token provided must not be empty.',
      'SyntaxError',
    );
  }

  if (ASCII_WHITESPACE_REGEX.test(tokenAsString)) {
    throw createDomException(
      `The token provided ('${tokenAsString}') contains HTML space characters, which are not valid in tokens.`,
      'InvalidCharacterError',
    );
  }

  return tokenAsString;
};
