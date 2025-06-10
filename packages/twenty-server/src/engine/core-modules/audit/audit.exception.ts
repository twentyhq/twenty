import { CustomException } from 'src/utils/custom-exception';

export class AuditException extends CustomException {
  declare code: AuditExceptionCode;
  constructor(message: string, code: AuditExceptionCode) {
    super(message, code);
  }
}

export enum AuditExceptionCode {
  INVALID_TYPE = 'INVALID_TYPE',
  INVALID_INPUT = 'INVALID_INPUT',
}
