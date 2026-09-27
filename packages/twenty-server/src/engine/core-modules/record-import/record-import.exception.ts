import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

import { CustomException } from 'src/utils/custom-exception';

export type RecordImportExceptionCode =
  | 'SESSION_NOT_FOUND'
  | 'SESSION_CONFLICT'
  | 'INVALID_STATE'
  | 'INVALID_INPUT'
  | 'UNSUPPORTED_FILE'
  | 'FILE_LIMIT_EXCEEDED'
  | 'PARSE_FAILED'
  | 'IMPORT_ALREADY_RUNNING'
  | 'MAPPING_OUTDATED'
  | 'QUEUE_UNAVAILABLE'
  | 'FORBIDDEN';

export class RecordImportException extends CustomException<RecordImportExceptionCode> {
  constructor(
    message: string,
    code: RecordImportExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ?? msg`The import failed. Please try again.`,
    });
  }
}
