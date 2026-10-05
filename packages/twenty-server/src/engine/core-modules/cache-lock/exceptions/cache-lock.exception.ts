import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

import {
  appendCommonExceptionCode,
  CustomException,
  type ExceptionCategory,
} from 'src/utils/custom-exception';

export class CacheLockException extends CustomException<
  keyof typeof CacheLockExceptionCode
> {
  constructor(
    message: string,
    code: keyof typeof CacheLockExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ?? msg`A cache lock error occurred.`,
      category: CACHE_LOCK_EXCEPTION_CATEGORY_BY_CODE[code],
    });
  }
}

export const CacheLockExceptionCode = appendCommonExceptionCode({
  LOCK_ACQUISITION_TIMEOUT: 'LOCK_ACQUISITION_TIMEOUT',
} as const);
const CACHE_LOCK_EXCEPTION_CATEGORY_BY_CODE = {
  [CacheLockExceptionCode.INTERNAL_SERVER_ERROR]: 'INTERNAL_SERVER_ERROR',
  [CacheLockExceptionCode.LOCK_ACQUISITION_TIMEOUT]: 'INTERNAL_SERVER_ERROR',
} as const satisfies Record<
  keyof typeof CacheLockExceptionCode,
  ExceptionCategory
>;
