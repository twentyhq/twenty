export const checkIfItsAViteStaleChunkLazyLoadingError = (error: Error) => {
  return error.message.includes('Failed to fetch dynamically imported module');
};
