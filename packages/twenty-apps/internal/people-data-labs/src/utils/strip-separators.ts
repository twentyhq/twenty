const WHITESPACE_AND_COMMA_REGEX = /[\s,]/g;

export const stripSeparators = (raw: string): string =>
  raw.replace(WHITESPACE_AND_COMMA_REGEX, '');
