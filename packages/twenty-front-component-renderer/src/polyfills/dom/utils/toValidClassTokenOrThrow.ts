import { isNonEmptyString } from '@sniptt/guards';

import { ASCII_WHITESPACE_REGEX } from '@/polyfills/dom/constants/AsciiWhitespaceRegex';

export const toValidClassTokenOrThrow = (token: string): string => {
  const tokenAsString = String(token);

  if (!isNonEmptyString(tokenAsString)) {
    throw new DOMException(
      'The token provided must not be empty.',
      'SyntaxError',
    );
  }

  if (ASCII_WHITESPACE_REGEX.test(tokenAsString)) {
    throw new DOMException(
      `The token provided ('${tokenAsString}') contains HTML space characters, which are not valid in tokens.`,
      'InvalidCharacterError',
    );
  }

  return tokenAsString;
};
