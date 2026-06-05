export const PdlErrorCode = {
  CONFIGURATION: 'CONFIGURATION',
  INVALID_INPUT: 'INVALID_INPUT',
  RECORD_NOT_FOUND: 'RECORD_NOT_FOUND',
} as const;

export type PdlErrorCode = (typeof PdlErrorCode)[keyof typeof PdlErrorCode];
