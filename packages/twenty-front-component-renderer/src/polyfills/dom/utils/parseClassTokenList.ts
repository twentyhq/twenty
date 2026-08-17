import { isNonEmptyString } from '@sniptt/guards';

const ASCII_WHITESPACE_SEPARATOR = /[\t\n\f\r ]+/;

export const parseClassTokenList = (classAttributeValue: string): string[] => {
  const orderedUniqueTokens: string[] = [];

  for (const token of classAttributeValue.split(ASCII_WHITESPACE_SEPARATOR)) {
    const isDuplicateToken = orderedUniqueTokens.includes(token);

    if (isNonEmptyString(token) && !isDuplicateToken) {
      orderedUniqueTokens.push(token);
    }
  }

  return orderedUniqueTokens;
};
