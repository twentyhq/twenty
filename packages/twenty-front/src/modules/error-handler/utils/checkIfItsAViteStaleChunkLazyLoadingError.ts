const VITE_STALE_CHUNK_ERROR_MESSAGES = [
  'Failed to fetch dynamically imported module',
  'error loading dynamically imported module',
  'Importing a module script failed',
  'Unable to preload CSS for',
];

export const checkIfItsAViteStaleChunkLazyLoadingError = (error: Error) => {
  return VITE_STALE_CHUNK_ERROR_MESSAGES.some((staleChunkErrorMessage) =>
    error.message.includes(staleChunkErrorMessage),
  );
};
