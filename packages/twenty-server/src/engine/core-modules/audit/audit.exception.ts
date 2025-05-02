import { CustomException } from 'src/utils/custom-exception';

export class AnalyticsException extends CustomException {
  constructor(message: string, code: AuditExceptionCode) {
    super(message, code);
  }
}

export enum AuditExceptionCode {
  INVALID_TYPE = 'INVALID_TYPE',
  INVALID_INPUT = 'INVALID_INPUT',
}
