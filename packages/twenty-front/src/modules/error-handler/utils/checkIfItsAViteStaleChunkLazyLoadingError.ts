const VITE_STALE_CHUNK_ERROR_MESSAGES = [
  // oxlint-disable-next-line lingui/no-unlocalized-strings -- These are exact browser error signatures used to identify stale chunks.
  'Failed to fetch dynamically imported module',
  // oxlint-disable-next-line lingui/no-unlocalized-strings -- These are exact browser error signatures used to identify stale chunks.
  'error loading dynamically imported module',
  // oxlint-disable-next-line lingui/no-unlocalized-strings -- These are exact browser error signatures used to identify stale chunks.
  'Importing a module script failed',
  // oxlint-disable-next-line lingui/no-unlocalized-strings -- These are exact browser error signatures used to identify stale chunks.
  'Unable to preload CSS for',
];

export const checkIfItsAViteStaleChunkLazyLoadingError = (error: Error) => {
  return VITE_STALE_CHUNK_ERROR_MESSAGES.some((staleChunkErrorMessage) =>
    error.message.includes(staleChunkErrorMessage),
  );
};
