const DUPLICATE_RECORD_MESSAGE_PATTERN = /duplicate (entry|key)/i;

export const isDuplicateRecordError = (error: unknown): boolean =>
  error instanceof Error &&
  DUPLICATE_RECORD_MESSAGE_PATTERN.test(error.message);
