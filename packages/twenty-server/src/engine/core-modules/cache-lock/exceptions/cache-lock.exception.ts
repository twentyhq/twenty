import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

import {
  appendCommonExceptionCode,
  CustomException,
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
    });
  }
}

export const CacheLockExceptionCode = appendCommonExceptionCode({
  LOCK_ACQUISITION_TIMEOUT: 'LOCK_ACQUISITION_TIMEOUT',
} as const);
