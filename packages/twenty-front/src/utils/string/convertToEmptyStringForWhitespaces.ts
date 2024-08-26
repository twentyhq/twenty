export const convertToEmptyStringForWhitespaces = (value: string): string => {
  return value.trim().length ? value : '';
};
