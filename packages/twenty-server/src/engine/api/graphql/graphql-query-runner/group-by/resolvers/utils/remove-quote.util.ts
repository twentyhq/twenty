const removeQuotes = (string: string): string => {
  return string.replace(/["']/g, '');
};

export const formatColumnNameAsAlias = (
  columnNameWithQuotes: string,
): string => {
  return removeQuotes(columnNameWithQuotes).replace(/\./g, '_');
};
