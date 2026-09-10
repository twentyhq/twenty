import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { assertUnreachable } from 'twenty-shared/utils';

import { CustomException } from 'src/utils/custom-exception';

export enum CacheStorageExceptionCode {
  SCRIPT_EXECUTION_FAILED = 'SCRIPT_EXECUTION_FAILED',
  REDIS_CACHE_REQUIRED = 'REDIS_CACHE_REQUIRED',
}

const getCacheStorageExceptionUserFriendlyMessage = (
  code: CacheStorageExceptionCode,
) => {
  switch (code) {
    case CacheStorageExceptionCode.SCRIPT_EXECUTION_FAILED:
    case CacheStorageExceptionCode.REDIS_CACHE_REQUIRED:
      return msg`An unexpected error occurred.`;
    default:
      assertUnreachable(code);
  }
};

export class CacheStorageException extends CustomException<CacheStorageExceptionCode> {
  constructor(
    message: string,
    code: CacheStorageExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ??
        getCacheStorageExceptionUserFriendlyMessage(code),
    });
  }
}
