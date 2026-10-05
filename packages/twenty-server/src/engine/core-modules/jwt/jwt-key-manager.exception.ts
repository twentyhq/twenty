import { type MessageDescriptor } from '@lingui/core';
import { assertUnreachable } from 'twenty-shared/utils';

import { STANDARD_ERROR_MESSAGE } from 'src/engine/api/common/common-query-runners/errors/standard-error-message.constant';
import {
  appendCommonExceptionCode,
  CustomException,
  type ExceptionCategory,
} from 'src/utils/custom-exception';

export const JwtKeyManagerExceptionCode = appendCommonExceptionCode({
  INVALID_PRIVATE_KEY: 'INVALID_PRIVATE_KEY',
  SIGNING_KEY_NOT_FOUND: 'SIGNING_KEY_NOT_FOUND',
} as const);

const getJwtKeyManagerExceptionUserFriendlyMessage = (
  code: keyof typeof JwtKeyManagerExceptionCode,
): MessageDescriptor => {
  switch (code) {
    case JwtKeyManagerExceptionCode.INVALID_PRIVATE_KEY:
    case JwtKeyManagerExceptionCode.SIGNING_KEY_NOT_FOUND:
    case JwtKeyManagerExceptionCode.INTERNAL_SERVER_ERROR:
      return STANDARD_ERROR_MESSAGE;
    default:
      return assertUnreachable(code);
  }
};
const JWT_KEY_MANAGER_EXCEPTION_CATEGORY_BY_CODE = {
  [JwtKeyManagerExceptionCode.INTERNAL_SERVER_ERROR]: 'INTERNAL_SERVER_ERROR',
  [JwtKeyManagerExceptionCode.INVALID_PRIVATE_KEY]: 'INTERNAL_SERVER_ERROR',
  [JwtKeyManagerExceptionCode.SIGNING_KEY_NOT_FOUND]: 'NOT_FOUND',
} as const satisfies Record<
  keyof typeof JwtKeyManagerExceptionCode,
  ExceptionCategory
>;

export class JwtKeyManagerException extends CustomException<
  keyof typeof JwtKeyManagerExceptionCode
> {
  constructor(
    message: string,
    code: keyof typeof JwtKeyManagerExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ??
        getJwtKeyManagerExceptionUserFriendlyMessage(code),
      category: JWT_KEY_MANAGER_EXCEPTION_CATEGORY_BY_CODE[code],
    });
  }
}
