import { isDefined } from 'twenty-shared/utils';

const CSS_ESCAPE_PATTERN = /\\([\da-f]{1,6}\s?|(\s)|.)/gi;

const decodeCssEscape = (
  _escapeSequence: string,
  escapedText: string,
  escapedWhitespace: string | undefined,
): string => {
  const supplementaryCodePointOffset = parseInt(escapedText, 16) - 0x10000;

  if (
    Number.isNaN(supplementaryCodePointOffset) ||
    isDefined(escapedWhitespace)
  ) {
    return escapedText;
  }

  if (supplementaryCodePointOffset < 0) {
    return String.fromCharCode(supplementaryCodePointOffset + 0x10000);
  }

  return String.fromCharCode(
    (supplementaryCodePointOffset >> 10) | 0xd800,
    (supplementaryCodePointOffset & 0x3ff) | 0xdc00,
  );
};

export const unescapeCssText = (text: string): string =>
  text.replace(CSS_ESCAPE_PATTERN, decodeCssEscape);
