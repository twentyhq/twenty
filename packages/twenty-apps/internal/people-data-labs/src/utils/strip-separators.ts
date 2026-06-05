const SEPARATOR_REGEX = /[\s,]/g;

export const stripSeparators = (raw: string): string =>
  raw.replace(SEPARATOR_REGEX, '');
