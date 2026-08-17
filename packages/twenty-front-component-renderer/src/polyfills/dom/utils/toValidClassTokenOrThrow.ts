import { isNonEmptyString } from '@sniptt/guards';

const ASCII_WHITESPACE_CHARACTER = /[\t\n\f\r ]/;

export const toValidClassTokenOrThrow = (token: string): string => {
  const tokenAsString = String(token);

  if (!isNonEmptyString(tokenAsString)) {
    throw new DOMException(
      'The token provided must not be empty.',
      'SyntaxError',
    );
  }

  if (ASCII_WHITESPACE_CHARACTER.test(tokenAsString)) {
    throw new DOMException(
      `The token provided ('${tokenAsString}') contains HTML space characters, which are not valid in tokens.`,
      'InvalidCharacterError',
    );
  }

  return tokenAsString;
};
