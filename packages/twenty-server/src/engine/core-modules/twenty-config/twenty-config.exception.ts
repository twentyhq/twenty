import { CustomException } from 'src/utils/custom-exception';

export class ConfigVariableException extends CustomException {
  constructor(message: string, code: ConfigVariableExceptionCode) {
    super(message, code);
  }
}

export enum ConfigVariableExceptionCode {
  VARIABLE_NOT_FOUND = 'VARIABLE_NOT_FOUND',
  METADATA_NOT_FOUND = 'METADATA_NOT_FOUND',
  ENVIRONMENT_ONLY_VARIABLE = 'ENVIRONMENT_ONLY_VARIABLE',
  DATABASE_CONFIG_DISABLED = 'DATABASE_CONFIG_DISABLED',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
}
