import { PdlError } from 'src/logic-functions/errors/pdl-error';
import { PdlErrorCode } from 'src/logic-functions/errors/pdl-error-code';

export class PdlConfigError extends PdlError {
  constructor(message: string) {
    super({ message, code: PdlErrorCode.CONFIGURATION });
  }
}
