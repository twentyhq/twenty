import { CustomException } from 'src/utils/custom-exception';

export class CommonQueryRunnerException extends CustomException<CommonQueryRunnerExceptionCode> {}

export enum CommonQueryRunnerExceptionCode {
  RECORD_NOT_FOUND = 'RECORD_NOT_FOUND',
  INVALID_QUERY_INPUT = 'INVALID_QUERY_INPUT',
  INVALID_AUTH_CONTEXT = 'INVALID_AUTH_CONTEXT',
}
