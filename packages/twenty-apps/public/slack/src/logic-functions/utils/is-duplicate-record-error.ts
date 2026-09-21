// The core API surfaces unique index violations as a generic BAD_USER_INPUT
// GraphQL error, so the message is the only discriminator available here.
const DUPLICATE_RECORD_MESSAGE_PATTERN = /duplicate (entry|key)/i;

export const isDuplicateRecordError = (error: unknown): boolean =>
  error instanceof Error &&
  DUPLICATE_RECORD_MESSAGE_PATTERN.test(error.message);
