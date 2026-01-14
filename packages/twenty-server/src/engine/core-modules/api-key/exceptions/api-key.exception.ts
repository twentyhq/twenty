import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { assertUnreachable } from 'twenty-shared/utils';

import { CustomException } from 'src/utils/custom-exception';

export enum ApiKeyExceptionCode {
  API_KEY_NOT_FOUND = 'API_KEY_NOT_FOUND',
  API_KEY_REVOKED = 'API_KEY_REVOKED',
  API_KEY_EXPIRED = 'API_KEY_EXPIRED',
  API_KEY_NO_ROLE_ASSIGNED = 'API_KEY_NO_ROLE_ASSIGNED',
  ROLE_CANNOT_BE_ASSIGNED_TO_API_KEYS = 'ROLE_CANNOT_BE_ASSIGNED_TO_API_KEYS',
}

const getApiKeyExceptionUserFriendlyMessage = (code: ApiKeyExceptionCode) => {
  switch (code) {
    case ApiKeyExceptionCode.API_KEY_NOT_FOUND:
      return msg`API key not found.`;
    case ApiKeyExceptionCode.API_KEY_REVOKED:
      return msg`This API key has been revoked.`;
    case ApiKeyExceptionCode.API_KEY_EXPIRED:
      return msg`This API key has expired.`;
    case ApiKeyExceptionCode.API_KEY_NO_ROLE_ASSIGNED:
      return msg`This API key has no role assigned.`;
    case ApiKeyExceptionCode.ROLE_CANNOT_BE_ASSIGNED_TO_API_KEYS:
      return msg`This role cannot be assigned to API keys.`;
    default:
      assertUnreachable(code);
  }
};

export class ApiKeyException extends CustomException<ApiKeyExceptionCode> {
  constructor(
    message: string,
    code: ApiKeyExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ?? getApiKeyExceptionUserFriendlyMessage(code),
    });
  }
}
