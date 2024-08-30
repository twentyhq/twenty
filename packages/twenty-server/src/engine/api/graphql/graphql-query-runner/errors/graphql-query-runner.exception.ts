import { CustomException } from 'src/utils/custom-exception';

export class GraphqlQueryRunnerException extends CustomException {
  code: GraphqlQueryRunnerExceptionCode;
  constructor(message: string, code: GraphqlQueryRunnerExceptionCode) {
    super(message, code);
  }
}

export enum GraphqlQueryRunnerExceptionCode {
  MAX_DEPTH_REACHED = 'MAX_DEPTH_REACHED',
  INVALID_CURSOR = 'INVALID_CURSOR',
  INVALID_DIRECTION = 'INVALID_DIRECTION',
  UNSUPPORTED_OPERATOR = 'UNSUPPORTED_OPERATOR',
  ARGS_CONFLICT = 'ARGS_CONFLICT',
  FIELD_NOT_FOUND = 'FIELD_NOT_FOUND',
  OBJECT_METADATA_NOT_FOUND = 'OBJECT_METADATA_NOT_FOUND',
}
