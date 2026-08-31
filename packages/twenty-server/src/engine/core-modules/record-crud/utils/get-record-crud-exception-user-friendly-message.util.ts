import { msg } from '@lingui/core/macro';

import { type RecordCrudExceptionCode } from 'src/engine/core-modules/record-crud/exceptions/record-crud-exception-code.enum';

export const getRecordCrudExceptionUserFriendlyMessage = (
  code: RecordCrudExceptionCode,
) => {
  switch (code) {
    case 'INVALID_REQUEST':
      return msg`Invalid request.`;
    case 'WORKSPACE_ID_NOT_FOUND':
      return msg`Workspace not found.`;
    case 'OBJECT_NOT_FOUND':
      return msg`Object not found.`;
    case 'RECORD_NOT_FOUND':
      return msg`Record not found.`;
    case 'RECORD_CREATION_FAILED':
      return msg`Failed to create record.`;
    case 'RECORD_UPDATE_FAILED':
      return msg`Failed to update record.`;
    case 'RECORD_DELETION_FAILED':
      return msg`Failed to delete record.`;
    case 'RECORD_UPSERT_FAILED':
      return msg`Failed to upsert record.`;
    case 'QUERY_FAILED':
      return msg`Query failed.`;
    default:
      throw new Error(`Unknown record CRUD exception code: ${code}`);
  }
};
