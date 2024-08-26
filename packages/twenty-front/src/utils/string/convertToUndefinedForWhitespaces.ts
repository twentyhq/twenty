export const convertToUndefinedForWhitespaces = (
  value: string,
): string | undefined => {
  return value.trim() === '' ? undefined : value;
};
