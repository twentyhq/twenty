export const turnIntoUndefinedIfWhitespacesOnly = (
  value: string,
): string | undefined => {
  return value.trim() === '' ? undefined : value;
};
