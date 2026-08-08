// select option values are stored as SCREAMING_SNAKE_CASE api names
const SCREAMING_SNAKE_CASE_PATTERN = /^[A-Z0-9]+(_[A-Z0-9]+)*$/;

// acronym-like segments such as B2B keep their casing
const hasDigit = (word: string): boolean => /\d/.test(word);

export const formatSlackRecordSelectValue = (value: string): string => {
  if (!SCREAMING_SNAKE_CASE_PATTERN.test(value)) {
    return value;
  }

  const words = value
    .split('_')
    .map((word) => (hasDigit(word) ? word : word.toLowerCase()));

  const [firstWord, ...restWords] = words;

  return [
    hasDigit(firstWord)
      ? firstWord
      : firstWord.charAt(0).toUpperCase() + firstWord.slice(1),
    ...restWords,
  ].join(' ');
};
