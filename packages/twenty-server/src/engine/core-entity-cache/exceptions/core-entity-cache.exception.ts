import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { assertUnreachable } from 'twenty-shared/utils';

import {
  appendCommonExceptionCode,
  CustomException,
} from 'src/utils/custom-exception';

export const CoreEntityCacheExceptionCode = appendCommonExceptionCode({
  INVALID_PARAMETERS: 'INVALID_PARAMETERS',
} as const);

const getCoreEntityCacheExceptionUserFriendlyMessage = (
  code: keyof typeof CoreEntityCacheExceptionCode,
) => {
  switch (code) {
    case CoreEntityCacheExceptionCode.INVALID_PARAMETERS:
      return msg`Invalid parameters provided.`;
    case CoreEntityCacheExceptionCode.INTERNAL_SERVER_ERROR:
      return msg`An unexpected error occurred.`;
    default:
      assertUnreachable(code);
  }
};

export class CoreEntityCacheException extends CustomException<
  keyof typeof CoreEntityCacheExceptionCode
> {
  constructor(
    message: string,
    code: keyof typeof CoreEntityCacheExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ??
        getCoreEntityCacheExceptionUserFriendlyMessage(code),
    });
  }
}
