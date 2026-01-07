import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { assertUnreachable } from 'twenty-shared/utils';

import { CustomException } from 'src/utils/custom-exception';

export enum ConfigVariableExceptionCode {
  DATABASE_CONFIG_DISABLED = 'DATABASE_CONFIG_DISABLED',
  ENVIRONMENT_ONLY_VARIABLE = 'ENVIRONMENT_ONLY_VARIABLE',
  VARIABLE_NOT_FOUND = 'VARIABLE_NOT_FOUND',
  VALIDATION_FAILED = 'VALIDATION_FAILED',
  UNSUPPORTED_CONFIG_TYPE = 'UNSUPPORTED_CONFIG_TYPE',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
}

const getConfigVariableExceptionUserFriendlyMessage = (
  code: ConfigVariableExceptionCode,
) => {
  switch (code) {
    case ConfigVariableExceptionCode.DATABASE_CONFIG_DISABLED:
      return msg`Database configuration is disabled.`;
    case ConfigVariableExceptionCode.ENVIRONMENT_ONLY_VARIABLE:
      return msg`This variable can only be set via environment.`;
    case ConfigVariableExceptionCode.VARIABLE_NOT_FOUND:
      return msg`Configuration variable not found.`;
    case ConfigVariableExceptionCode.VALIDATION_FAILED:
      return msg`Configuration validation failed.`;
    case ConfigVariableExceptionCode.UNSUPPORTED_CONFIG_TYPE:
      return msg`Unsupported configuration type.`;
    case ConfigVariableExceptionCode.INTERNAL_ERROR:
      return msg`An unexpected configuration error occurred.`;
    default:
      assertUnreachable(code);
  }
};

export class ConfigVariableException extends CustomException<ConfigVariableExceptionCode> {
  constructor(
    message: string,
    code: ConfigVariableExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ??
        getConfigVariableExceptionUserFriendlyMessage(code),
    });
  }
}
