import { msg } from '@lingui/core/macro';
import { assertUnreachable } from 'twenty-shared/utils';

import { RecordCrudExceptionCode } from 'src/engine/core-modules/record-crud/exceptions/record-crud-exception-code.enum';

export const getRecordCrudExceptionUserFriendlyMessage = (
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
