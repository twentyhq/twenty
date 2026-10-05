import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { assertUnreachable } from 'twenty-shared/utils';

import {
  CustomException,
  type ExceptionCategory,
} from 'src/utils/custom-exception';

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
const CONFIG_VARIABLE_EXCEPTION_CATEGORY_BY_CODE = {
  [ConfigVariableExceptionCode.DATABASE_CONFIG_DISABLED]: 'BAD_USER_INPUT',
  [ConfigVariableExceptionCode.ENVIRONMENT_ONLY_VARIABLE]: 'FORBIDDEN',
  [ConfigVariableExceptionCode.VARIABLE_NOT_FOUND]: 'NOT_FOUND',
  [ConfigVariableExceptionCode.VALIDATION_FAILED]: 'BAD_USER_INPUT',
  [ConfigVariableExceptionCode.UNSUPPORTED_CONFIG_TYPE]:
    'INTERNAL_SERVER_ERROR',
  [ConfigVariableExceptionCode.INTERNAL_ERROR]: 'INTERNAL_SERVER_ERROR',
} as const satisfies Record<ConfigVariableExceptionCode, ExceptionCategory>;

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
      category: CONFIG_VARIABLE_EXCEPTION_CATEGORY_BY_CODE[code],
    });
  }
}
