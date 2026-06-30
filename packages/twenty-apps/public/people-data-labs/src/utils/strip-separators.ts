const WHITESPACE_AND_COMMA_REGEX = /[\s,]/g;

export const stripSeparators = (rawValue: string): string =>
  rawValue.replace(WHITESPACE_AND_COMMA_REGEX, '');
