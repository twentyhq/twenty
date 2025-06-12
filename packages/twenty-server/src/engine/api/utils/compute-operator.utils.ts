export const computeOperator = (
  isAscending: boolean,
  isForwardPagination: boolean,
): string => {
  return isAscending
    ? isForwardPagination
      ? 'gt'
      : 'lt'
    : isForwardPagination
      ? 'lt'
      : 'gt';
};
