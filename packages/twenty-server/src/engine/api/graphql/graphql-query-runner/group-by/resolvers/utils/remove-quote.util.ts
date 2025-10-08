export const removeQuotes = (string: string): string => {
  return string.replace(/["']/g, '');
};
