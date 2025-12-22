import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

import { CustomException } from 'src/utils/custom-exception';

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

const recordCrudExceptionUserFriendlyMessages: Record<
  RecordCrudExceptionCode,
  MessageDescriptor
> = {
  [RecordCrudExceptionCode.INVALID_REQUEST]: msg`Invalid request.`,
  [RecordCrudExceptionCode.WORKSPACE_ID_NOT_FOUND]: msg`Workspace not found.`,
  [RecordCrudExceptionCode.OBJECT_NOT_FOUND]: msg`Object not found.`,
  [RecordCrudExceptionCode.RECORD_NOT_FOUND]: msg`Record not found.`,
  [RecordCrudExceptionCode.RECORD_CREATION_FAILED]: msg`Failed to create record.`,
  [RecordCrudExceptionCode.RECORD_UPDATE_FAILED]: msg`Failed to update record.`,
  [RecordCrudExceptionCode.RECORD_DELETION_FAILED]: msg`Failed to delete record.`,
  [RecordCrudExceptionCode.RECORD_UPSERT_FAILED]: msg`Failed to upsert record.`,
  [RecordCrudExceptionCode.QUERY_FAILED]: msg`Query failed.`,
};

export class RecordCrudException extends CustomException<RecordCrudExceptionCode> {
  constructor(
    message: string,
    code: RecordCrudExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ?? recordCrudExceptionUserFriendlyMessages[code],
    });
  }
}
