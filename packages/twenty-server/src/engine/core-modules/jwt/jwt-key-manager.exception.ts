import { type MessageDescriptor } from '@lingui/core';
import { assertUnreachable } from 'twenty-shared/utils';

import { STANDARD_ERROR_MESSAGE } from 'src/engine/api/common/common-query-runners/errors/standard-error-message.constant';
import {
  appendCommonExceptionCode,
  CustomException,
} from 'src/utils/custom-exception';

export const JwtKeyManagerExceptionCode = appendCommonExceptionCode({
  INVALID_PRIVATE_KEY: 'INVALID_PRIVATE_KEY',
  INVALID_PUBLIC_KEY: 'INVALID_PUBLIC_KEY',
  SIGNING_KEY_PERSISTENCE_FAILED: 'SIGNING_KEY_PERSISTENCE_FAILED',
  SIGNING_KEY_GENERATION_FAILED: 'SIGNING_KEY_GENERATION_FAILED',
  SIGNING_KEY_DECRYPTION_FAILED: 'SIGNING_KEY_DECRYPTION_FAILED',
} as const);

const getJwtKeyManagerExceptionUserFriendlyMessage = (
  code: keyof typeof JwtKeyManagerExceptionCode,
): MessageDescriptor => {
  switch (code) {
    case JwtKeyManagerExceptionCode.INVALID_PRIVATE_KEY:
    case JwtKeyManagerExceptionCode.INVALID_PUBLIC_KEY:
    case JwtKeyManagerExceptionCode.SIGNING_KEY_PERSISTENCE_FAILED:
    case JwtKeyManagerExceptionCode.SIGNING_KEY_GENERATION_FAILED:
    case JwtKeyManagerExceptionCode.SIGNING_KEY_DECRYPTION_FAILED:
    case JwtKeyManagerExceptionCode.INTERNAL_SERVER_ERROR:
      return STANDARD_ERROR_MESSAGE;
    default:
      return assertUnreachable(code);
  }
};

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
    });
  }
}
