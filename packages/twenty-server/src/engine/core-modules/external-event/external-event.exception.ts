import { CustomException } from 'src/utils/custom-exception';

export enum ExternalEventExceptionCode {
  INVALID_INPUT = 'INVALID_INPUT',
  INVALID_AUTH = 'INVALID_AUTH',
  CLICKHOUSE_ERROR = 'CLICKHOUSE_ERROR',
  TOKEN_CREATION_ERROR = 'TOKEN_CREATION_ERROR',
  FEATURE_DISABLED = 'FEATURE_DISABLED',
}

export class ExternalEventException extends CustomException {
  constructor(message: string, code: ExternalEventExceptionCode) {
    super(message, code);
  }
}
