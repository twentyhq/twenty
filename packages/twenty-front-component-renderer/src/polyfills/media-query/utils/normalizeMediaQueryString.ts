import { ASCII_WHITESPACE_REGEX } from '@/polyfills/dom/constants/AsciiWhitespaceRegex';
import { lowercaseAsciiLetters } from '@/polyfills/media-query/utils/lowercaseAsciiLetters';
import { trimCssWhitespace } from '@/polyfills/media-query/utils/trimCssWhitespace';

const CSS_WHITESPACE_RUN_PATTERN = new RegExp(
  ASCII_WHITESPACE_REGEX.source,
  'g',
);

const SINGLE_SPACE = ' ';

const CLOSING_PARENTHESIS_FOLLOWED_BY_AND_PATTERN = /\) ?and /g;

const CLOSING_PARENTHESIS_AND_SEPARATOR = ') and ';

export const normalizeMediaQueryString = (mediaQueryString: string): string =>
  lowercaseAsciiLetters(
    trimCssWhitespace(mediaQueryString).replace(
      CSS_WHITESPACE_RUN_PATTERN,
      SINGLE_SPACE,
    ),
  ).replace(
    CLOSING_PARENTHESIS_FOLLOWED_BY_AND_PATTERN,
    CLOSING_PARENTHESIS_AND_SEPARATOR,
  );
