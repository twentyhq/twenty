export const UNDELIVERED_FILE_REASON = {
  unavailable:
    'file could not be loaded, it may have been deleted or its link expired. Query its record again to get a new link',
  tooLarge:
    'file exceeds the size or file count this model accepts in one request',
  rejected: 'the AI provider could not process this file',
} as const;
