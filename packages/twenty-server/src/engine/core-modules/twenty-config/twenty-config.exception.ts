import { CustomException } from 'src/utils/custom-exception';

export class ConfigVariableException extends CustomException {
  constructor(message: string, code: ConfigVariableExceptionCode) {
    super(message, code);
  }
}

export enum ConfigVariableExceptionCode {
  DATABASE_CONFIG_DISABLED = 'DATABASE_CONFIG_DISABLED',
  ENVIRONMENT_ONLY_VARIABLE = 'ENVIRONMENT_ONLY_VARIABLE',
  VARIABLE_NOT_FOUND = 'VARIABLE_NOT_FOUND',
  VALIDATION_FAILED = 'VALIDATION_FAILED',
  UNSUPPORTED_CONFIG_TYPE = 'UNSUPPORTED_CONFIG_TYPE',
  METADATA_NOT_FOUND = 'METADATA_NOT_FOUND',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
}
