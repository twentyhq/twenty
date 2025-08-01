import { CustomException } from 'src/utils/custom-exception';

export class AuditException extends CustomException<AuditExceptionCode> {}

export enum AuditExceptionCode {
  INVALID_TYPE = 'INVALID_TYPE',
  INVALID_INPUT = 'INVALID_INPUT',
}
