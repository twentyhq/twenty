import { PdlError } from 'src/logic-functions/errors/pdl-error';
import { PdlErrorCode } from 'src/logic-functions/errors/pdl-error-code';

export class PdlOperationError extends PdlError {
  constructor(message: string) {
    super({ message, code: PdlErrorCode.OPERATION_FAILED });
  }
}
