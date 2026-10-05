import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { assertUnreachable } from 'twenty-shared/utils';

import {
  CustomException,
  type ExceptionCategory,
} from 'src/utils/custom-exception';

export enum RecordCrudExceptionCode {
  INVALID_REQUEST = 'INVALID_REQUEST',
  WORKSPACE_ID_NOT_FOUND = 'WORKSPACE_ID_NOT_FOUND',
  OBJECT_NOT_FOUND = 'OBJECT_NOT_FOUND',
  RECORD_NOT_FOUND = 'RECORD_NOT_FOUND',
  RECORD_CREATION_FAILED = 'RECORD_CREATION_FAILED',
  RECORD_UPDATE_FAILED = 'RECORD_UPDATE_FAILED',
  RECORD_DELETION_FAILED = 'RECORD_DELETION_FAILED',
  RECORD_UPSERT_FAILED = 'RECORD_UPSERT_FAILED',
  QUERY_FAILED = 'QUERY_FAILED',
}

const getRecordCrudExceptionUserFriendlyMessage = (
  code: RecordCrudExceptionCode,
) => {
  switch (code) {
    case RecordCrudExceptionCode.INVALID_REQUEST:
      return msg`Invalid request.`;
    case RecordCrudExceptionCode.WORKSPACE_ID_NOT_FOUND:
      return msg`Workspace not found.`;
    case RecordCrudExceptionCode.OBJECT_NOT_FOUND:
      return msg`Object not found.`;
    case RecordCrudExceptionCode.RECORD_NOT_FOUND:
      return msg`Record not found.`;
    case RecordCrudExceptionCode.RECORD_CREATION_FAILED:
      return msg`Failed to create record.`;
    case RecordCrudExceptionCode.RECORD_UPDATE_FAILED:
      return msg`Failed to update record.`;
    case RecordCrudExceptionCode.RECORD_DELETION_FAILED:
      return msg`Failed to delete record.`;
    case RecordCrudExceptionCode.RECORD_UPSERT_FAILED:
      return msg`Failed to upsert record.`;
    case RecordCrudExceptionCode.QUERY_FAILED:
      return msg`Query failed.`;
    default:
      assertUnreachable(code);
  }
};
const RECORD_CRUD_EXCEPTION_CATEGORY_BY_CODE = {
  [RecordCrudExceptionCode.INVALID_REQUEST]: 'BAD_USER_INPUT',
  [RecordCrudExceptionCode.WORKSPACE_ID_NOT_FOUND]: 'INTERNAL_SERVER_ERROR',
  [RecordCrudExceptionCode.OBJECT_NOT_FOUND]: 'INTERNAL_SERVER_ERROR',
  [RecordCrudExceptionCode.RECORD_NOT_FOUND]: 'INTERNAL_SERVER_ERROR',
  [RecordCrudExceptionCode.RECORD_CREATION_FAILED]: 'INTERNAL_SERVER_ERROR',
  [RecordCrudExceptionCode.RECORD_UPDATE_FAILED]: 'INTERNAL_SERVER_ERROR',
  [RecordCrudExceptionCode.RECORD_DELETION_FAILED]: 'INTERNAL_SERVER_ERROR',
  [RecordCrudExceptionCode.RECORD_UPSERT_FAILED]: 'INTERNAL_SERVER_ERROR',
  [RecordCrudExceptionCode.QUERY_FAILED]: 'INTERNAL_SERVER_ERROR',
} as const satisfies Record<RecordCrudExceptionCode, ExceptionCategory>;

export class RecordCrudException extends CustomException<RecordCrudExceptionCode> {
  constructor(
    message: string,
    code: RecordCrudExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ?? getRecordCrudExceptionUserFriendlyMessage(code),
      category: RECORD_CRUD_EXCEPTION_CATEGORY_BY_CODE[code],
    });
  }
}
