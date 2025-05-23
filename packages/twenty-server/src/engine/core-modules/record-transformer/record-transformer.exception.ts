import { CustomException } from 'src/utils/custom-exception';

export class RecordTransformerException extends CustomException {
  declare code: RecordTransformerExceptionCode;
  constructor(message: string, code: RecordTransformerExceptionCode) {
    super(message, code);
  }
}

export enum RecordTransformerExceptionCode {
  INVALID_URL = 'INVALID_URL',
}
