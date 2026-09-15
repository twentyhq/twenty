import { PdlError } from 'src/logic-functions/errors/pdl-error';
import { PdlErrorCode } from 'src/logic-functions/errors/pdl-error-code';

export class PdlRecordNotFoundError extends PdlError {
  readonly objectNameSingular: string;
  readonly recordId: string;

  constructor({
    objectNameSingular,
    recordId,
  }: {
    objectNameSingular: string;
    recordId: string;
  }) {
    super({
      message: `${objectNameSingular} ${recordId} not found`,
      code: PdlErrorCode.RECORD_NOT_FOUND,
    });
    this.objectNameSingular = objectNameSingular;
    this.recordId = recordId;
  }
}
