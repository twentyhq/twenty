/* @license Enterprise */

import { type MessageDescriptor } from '@lingui/core';

import { STANDARD_ERROR_MESSAGE } from 'src/engine/api/common/common-query-runners/errors/standard-error-message.constant';
import {
  CustomException,
  type ExceptionCategory,
} from 'src/utils/custom-exception';

export enum RecordShareExceptionCode {
  INVALID_SHARE_WITH = 'INVALID_SHARE_WITH',
  TRANSACTION_SCOPE_WORKSPACE_MISMATCH = 'TRANSACTION_SCOPE_WORKSPACE_MISMATCH',
}
const RECORD_SHARE_EXCEPTION_CATEGORY_BY_CODE = {
  [RecordShareExceptionCode.INVALID_SHARE_WITH]: 'BAD_USER_INPUT',
  [RecordShareExceptionCode.TRANSACTION_SCOPE_WORKSPACE_MISMATCH]:
    'INTERNAL_SERVER_ERROR',
} as const satisfies Record<RecordShareExceptionCode, ExceptionCategory>;

export class RecordShareException extends CustomException<RecordShareExceptionCode> {
  constructor(
    message: string,
    code: RecordShareExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage: userFriendlyMessage ?? STANDARD_ERROR_MESSAGE,
      category: RECORD_SHARE_EXCEPTION_CATEGORY_BY_CODE[code],
    });
  }
}
