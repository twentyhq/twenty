/* @license Enterprise */

import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { assertUnreachable } from 'twenty-shared/utils';

import { CustomException } from 'src/utils/custom-exception';

export enum EnterpriseExceptionCode {
  INVALID_ENTERPRISE_KEY = 'INVALID_ENTERPRISE_KEY',
  CONFIG_VARIABLES_IN_DB_DISABLED = 'CONFIG_VARIABLES_IN_DB_DISABLED',
}

const getEnterpriseExceptionUserFriendlyMessage = (
  code: EnterpriseExceptionCode,
) => {
  switch (code) {
    case EnterpriseExceptionCode.INVALID_ENTERPRISE_KEY:
      return msg`Invalid enterprise key.`;
    case EnterpriseExceptionCode.CONFIG_VARIABLES_IN_DB_DISABLED:
      return msg`IS_CONFIG_VARIABLES_IN_DB_ENABLED is false on your server. Please add ENTERPRISE_KEY to your .env file manually.`;
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
