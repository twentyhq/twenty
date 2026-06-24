const DIACRITICS_REGEX = new RegExp('[\\u0300-\\u036f]', 'g');
const NON_ALPHANUMERIC_RUN_REGEX = /[^A-Z0-9]+/g;
const LEADING_OR_TRAILING_UNDERSCORE_REGEX = /^_+|_+$/g;
const LEADING_DIGIT_REGEX = /^(\d)/;

export const normalizeEnumValue = (rawEnumValue: string): string => {
  const withoutDiacritics = rawEnumValue
    .normalize('NFKD')
    .replace(DIACRITICS_REGEX, '');
  const upperCased = withoutDiacritics.toUpperCase();
  const underscored = upperCased.replace(NON_ALPHANUMERIC_RUN_REGEX, '_');
  const trimmed = underscored.replace(LEADING_OR_TRAILING_UNDERSCORE_REGEX, '');

  return trimmed.replace(LEADING_DIGIT_REGEX, '_$1');
};
