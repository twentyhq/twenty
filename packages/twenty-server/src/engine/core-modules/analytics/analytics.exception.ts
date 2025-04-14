import { CustomException } from 'src/utils/custom-exception';

export class AnalyticsException extends CustomException {
  constructor(message: string, code: AnalyticsExceptionCode) {
    super(message, code);
  }
}

export enum AnalyticsExceptionCode {
  INVALID_TYPE = 'INVALID_TYPE',
  INVALID_INPUT = 'INVALID_INPUT',
}
