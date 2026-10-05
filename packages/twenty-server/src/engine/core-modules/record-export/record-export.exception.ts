import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

import {
  CustomException,
  type ExceptionCategory,
} from 'src/utils/custom-exception';

type RecordExportExceptionCode =
  | 'QUEUE_UNAVAILABLE'
  | 'DURATION_LIMIT_EXCEEDED'
  | 'FILE_SIZE_LIMIT_EXCEEDED'
  | 'CONNECTION_CLOSED'
  | 'PAGINATION_FAILED'
  | 'RECORD_COUNT_UNAVAILABLE';
const RECORD_EXPORT_EXCEPTION_CATEGORY_BY_CODE = {
  QUEUE_UNAVAILABLE: 'INTERNAL_SERVER_ERROR',
  DURATION_LIMIT_EXCEEDED: 'INTERNAL_SERVER_ERROR',
  FILE_SIZE_LIMIT_EXCEEDED: 'INTERNAL_SERVER_ERROR',
  CONNECTION_CLOSED: 'INTERNAL_SERVER_ERROR',
  PAGINATION_FAILED: 'INTERNAL_SERVER_ERROR',
  RECORD_COUNT_UNAVAILABLE: 'INTERNAL_SERVER_ERROR',
} as const satisfies Record<RecordExportExceptionCode, ExceptionCategory>;

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
      category: RECORD_EXPORT_EXCEPTION_CATEGORY_BY_CODE[code],
    });
  }
}
