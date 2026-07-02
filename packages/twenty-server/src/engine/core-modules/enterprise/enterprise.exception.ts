/* @license Enterprise */

import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { assertUnreachable } from 'twenty-shared/utils';

import { CustomException } from 'src/utils/custom-exception';

export enum EnterpriseExceptionCode {
  INVALID_ENTERPRISE_KEY = 'INVALID_ENTERPRISE_KEY',
  CONFIG_VARIABLES_IN_DB_DISABLED = 'CONFIG_VARIABLES_IN_DB_DISABLED',
  ENTERPRISE_KEY_BOUND_TO_ANOTHER_SERVER = 'ENTERPRISE_KEY_BOUND_TO_ANOTHER_SERVER',
  ENTERPRISE_RELEASE_RATE_LIMITED = 'ENTERPRISE_RELEASE_RATE_LIMITED',
  ENTERPRISE_VALIDITY_TOKEN_RATE_LIMITED = 'ENTERPRISE_VALIDITY_TOKEN_RATE_LIMITED',
}

const getEnterpriseExceptionUserFriendlyMessage = (
  code: EnterpriseExceptionCode,
) => {
  switch (code) {
    case EnterpriseExceptionCode.INVALID_ENTERPRISE_KEY:
      return msg`Invalid enterprise key.`;
    case EnterpriseExceptionCode.CONFIG_VARIABLES_IN_DB_DISABLED:
      return msg`IS_CONFIG_VARIABLES_IN_DB_ENABLED is false on your server. Please add ENTERPRISE_KEY to your .env file manually.`;
    case EnterpriseExceptionCode.ENTERPRISE_KEY_BOUND_TO_ANOTHER_SERVER:
      return msg`This enterprise key is already in use on another server instance. Release it from that server, or transfer it to this one.`;
    case EnterpriseExceptionCode.ENTERPRISE_RELEASE_RATE_LIMITED:
      return msg`You have reached the maximum number of server transfers allowed this month for this enterprise key. Please try again later.`;
    case EnterpriseExceptionCode.ENTERPRISE_VALIDITY_TOKEN_RATE_LIMITED:
      return msg`You have reached the maximum number of license refreshes allowed today for this enterprise key. Please try again later.`;
    default:
      assertUnreachable(code);
  }
};

export class EnterpriseException extends CustomException<EnterpriseExceptionCode> {
  constructor(
    message: string,
    code: EnterpriseExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ?? getEnterpriseExceptionUserFriendlyMessage(code),
    });
  }
}
