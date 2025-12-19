import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

import { CustomException } from 'src/utils/custom-exception';

export enum ApiKeyExceptionCode {
  API_KEY_NOT_FOUND = 'API_KEY_NOT_FOUND',
  API_KEY_REVOKED = 'API_KEY_REVOKED',
  API_KEY_EXPIRED = 'API_KEY_EXPIRED',
  API_KEY_NO_ROLE_ASSIGNED = 'API_KEY_NO_ROLE_ASSIGNED',
  ROLE_CANNOT_BE_ASSIGNED_TO_API_KEYS = 'ROLE_CANNOT_BE_ASSIGNED_TO_API_KEYS',
}

const apiKeyExceptionUserFriendlyMessages: Record<
  ApiKeyExceptionCode,
  MessageDescriptor
> = {
  [ApiKeyExceptionCode.API_KEY_NOT_FOUND]: msg`API key not found.`,
  [ApiKeyExceptionCode.API_KEY_REVOKED]: msg`This API key has been revoked.`,
  [ApiKeyExceptionCode.API_KEY_EXPIRED]: msg`This API key has expired.`,
  [ApiKeyExceptionCode.API_KEY_NO_ROLE_ASSIGNED]: msg`This API key has no role assigned.`,
  [ApiKeyExceptionCode.ROLE_CANNOT_BE_ASSIGNED_TO_API_KEYS]: msg`This role cannot be assigned to API keys.`,
};

export class ApiKeyException extends CustomException<ApiKeyExceptionCode> {
  constructor(
    message: string,
    code: ApiKeyExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ?? apiKeyExceptionUserFriendlyMessages[code],
    });
  }
}
