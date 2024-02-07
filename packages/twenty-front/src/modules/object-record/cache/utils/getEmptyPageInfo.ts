export const getEmptyPageInfo = () => {
  return {
    hasNextPage: false,
    hasPreviousPage: false,
    startCursor: null,
    endCursor: null,
  };
};
