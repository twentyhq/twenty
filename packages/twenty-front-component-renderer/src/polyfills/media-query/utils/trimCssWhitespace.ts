import { ASCII_WHITESPACE_REGEX } from '@/polyfills/dom/constants/AsciiWhitespaceRegex';

export const trimCssWhitespace = (value: string): string => {
  let startIndex = 0;
  let endIndex = value.length;

  while (
    startIndex < endIndex &&
    ASCII_WHITESPACE_REGEX.test(value[startIndex])
  ) {
    startIndex += 1;
  }

  while (
    endIndex > startIndex &&
    ASCII_WHITESPACE_REGEX.test(value[endIndex - 1])
  ) {
    endIndex -= 1;
  }

  return value.slice(startIndex, endIndex);
};
