import { CustomException } from 'src/utils/custom-exception';

export class RecordCrudException extends CustomException {
  code: RecordCrudExceptionCode;
  constructor(message: string, code: RecordCrudExceptionCode) {
    super(message, code);
  }
}

export enum RecordCrudExceptionCode {
  INVALID_REQUEST = 'INVALID_REQUEST',
  WORKSPACE_ID_NOT_FOUND = 'WORKSPACE_ID_NOT_FOUND',
  OBJECT_NOT_FOUND = 'OBJECT_NOT_FOUND',
  RECORD_NOT_FOUND = 'RECORD_NOT_FOUND',
  RECORD_CREATION_FAILED = 'RECORD_CREATION_FAILED',
  RECORD_UPDATE_FAILED = 'RECORD_UPDATE_FAILED',
  RECORD_DELETION_FAILED = 'RECORD_DELETION_FAILED',
  QUERY_FAILED = 'QUERY_FAILED',
}
