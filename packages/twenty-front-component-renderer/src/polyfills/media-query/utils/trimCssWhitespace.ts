import { CSS_WHITESPACE_CHARACTER_CLASS } from '@/polyfills/media-query/constants/CssWhitespaceCharacterClass';

const SURROUNDING_CSS_WHITESPACE_PATTERN = new RegExp(
  `^${CSS_WHITESPACE_CHARACTER_CLASS}+|${CSS_WHITESPACE_CHARACTER_CLASS}+$`,
  'g',
);

export const trimCssWhitespace = (value: string): string =>
  value.replace(SURROUNDING_CSS_WHITESPACE_PATTERN, '');
