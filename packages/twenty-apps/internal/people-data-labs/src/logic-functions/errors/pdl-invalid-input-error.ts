import { PdlError } from 'src/logic-functions/errors/pdl-error';
import { PdlErrorCode } from 'src/logic-functions/errors/pdl-error-code';

export class PdlInvalidInputError extends PdlError {
  constructor(message: string) {
    super({ message, code: PdlErrorCode.INVALID_INPUT });
  }
}
