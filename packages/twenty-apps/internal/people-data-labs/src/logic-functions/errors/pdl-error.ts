export const PdlErrorCode = {
  CONFIGURATION: 'CONFIGURATION',
  INVALID_INPUT: 'INVALID_INPUT',
  RECORD_NOT_FOUND: 'RECORD_NOT_FOUND',
} as const;

export type PdlErrorCode = (typeof PdlErrorCode)[keyof typeof PdlErrorCode];

export abstract class PdlError extends Error {
  readonly code: PdlErrorCode;

  constructor({ message, code }: { message: string; code: PdlErrorCode }) {
    super(message);
    this.name = new.target.name;
    this.code = code;
  }
}
