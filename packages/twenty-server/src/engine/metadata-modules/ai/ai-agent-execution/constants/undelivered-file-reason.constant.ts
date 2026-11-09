export const UNDELIVERED_FILE_REASON = {
  unavailable:
    'file could not be loaded, it may have been deleted or its link expired',
  tooLarge:
    'file is too large for this model, or too many files are attached to this conversation',
  rejected: 'the AI provider could not process this file',
} as const;
