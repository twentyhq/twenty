export const turnIntoEmptyStringIfWhitespacesOnly = (value: string): string => {
  return value.trim().length > 0 ? value : '';
};
