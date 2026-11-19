export const UNDELIVERED_FILE_REASON = {
  unavailable:
    'file could not be loaded, it may have been deleted or its link expired. Query its record again to get a new link',
  tooLarge:
    'file exceeds the size or file count this model accepts in one request',
  rejected: 'the AI provider could not process this file',
  earlierTurn:
    'file was attached in an earlier turn and is no longer included. Read it again if you need its content',
} as const;
