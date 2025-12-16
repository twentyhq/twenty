import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

import { CustomException } from 'src/utils/custom-exception';

export enum ConfigVariableExceptionCode {
  DATABASE_CONFIG_DISABLED = 'DATABASE_CONFIG_DISABLED',
  ENVIRONMENT_ONLY_VARIABLE = 'ENVIRONMENT_ONLY_VARIABLE',
  VARIABLE_NOT_FOUND = 'VARIABLE_NOT_FOUND',
  VALIDATION_FAILED = 'VALIDATION_FAILED',
  UNSUPPORTED_CONFIG_TYPE = 'UNSUPPORTED_CONFIG_TYPE',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
}

const configVariableExceptionUserFriendlyMessages: Record<
  ConfigVariableExceptionCode,
  MessageDescriptor
> = {
  [ConfigVariableExceptionCode.DATABASE_CONFIG_DISABLED]: msg`Database configuration is disabled.`,
  [ConfigVariableExceptionCode.ENVIRONMENT_ONLY_VARIABLE]: msg`This variable can only be set via environment.`,
  [ConfigVariableExceptionCode.VARIABLE_NOT_FOUND]: msg`Configuration variable not found.`,
  [ConfigVariableExceptionCode.VALIDATION_FAILED]: msg`Configuration validation failed.`,
  [ConfigVariableExceptionCode.UNSUPPORTED_CONFIG_TYPE]: msg`Unsupported configuration type.`,
  [ConfigVariableExceptionCode.INTERNAL_ERROR]: msg`An unexpected configuration error occurred.`,
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
        configVariableExceptionUserFriendlyMessages[code],
    });
  }
}
