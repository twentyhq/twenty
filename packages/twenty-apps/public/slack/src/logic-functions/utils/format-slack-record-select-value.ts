// select option values are stored as SCREAMING_SNAKE_CASE api names
const SCREAMING_SNAKE_CASE_PATTERN = /^[A-Z0-9]+(_[A-Z0-9]+)*$/;

export const formatSlackRecordSelectValue = (value: string): string => {
  if (!SCREAMING_SNAKE_CASE_PATTERN.test(value)) {
    return value;
  }

  const words = value.toLowerCase().split('_');

  return [
    words[0].charAt(0).toUpperCase() + words[0].slice(1),
    ...words.slice(1),
  ].join(' ');
};
