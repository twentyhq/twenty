import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

import { CustomException } from 'src/utils/custom-exception';

type RecordExportExceptionCode =
  | 'QUEUE_UNAVAILABLE'
  | 'DURATION_LIMIT_EXCEEDED'
  | 'FILE_SIZE_LIMIT_EXCEEDED'
  | 'CONNECTION_CLOSED'
  | 'PAGINATION_FAILED'
  | 'RECORD_COUNT_UNAVAILABLE';

export class RecordExportException extends CustomException<RecordExportExceptionCode> {
  constructor(
    message: string,
    code: RecordExportExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ??
        msg`The export failed. Please try again or export fewer records.`,
    });
  }
}
