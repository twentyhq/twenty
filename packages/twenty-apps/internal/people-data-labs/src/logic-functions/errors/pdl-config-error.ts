import { PdlError, PdlErrorCode } from 'src/logic-functions/errors/pdl-error';

export class PdlConfigError extends PdlError {
  constructor(message: string) {
    super({ message, code: PdlErrorCode.CONFIGURATION });
  }
}
