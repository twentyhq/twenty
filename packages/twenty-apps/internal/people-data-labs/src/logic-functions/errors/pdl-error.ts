import { type PdlErrorCode } from 'src/logic-functions/errors/pdl-error-code';

export abstract class PdlError extends Error {
  readonly code: PdlErrorCode;

  constructor({ message, code }: { message: string; code: PdlErrorCode }) {
    super(message);
    this.name = new.target.name;
    this.code = code;
  }
}
