export const computeOperator = (
  isAscending: boolean,
  isForwardPagination: boolean,
  defaultOperator?: string,
): string => {
  if (defaultOperator) return defaultOperator;

  return isAscending
    ? isForwardPagination
      ? 'gt'
      : 'lt'
    : isForwardPagination
      ? 'lt'
      : 'gt';
};
