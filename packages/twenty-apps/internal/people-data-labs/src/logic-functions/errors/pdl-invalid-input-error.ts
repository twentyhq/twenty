import { PdlError, PdlErrorCode } from 'src/logic-functions/errors/pdl-error';

export class PdlInvalidInputError extends PdlError {
  constructor(message: string) {
    super({ message, code: PdlErrorCode.INVALID_INPUT });
  }
}
