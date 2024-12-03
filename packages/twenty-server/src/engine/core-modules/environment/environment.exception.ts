import { CustomException } from 'src/utils/custom-exception';

export class EnvironmentException extends CustomException {
  code: EnvironmentExceptionCode;
  constructor(message: string, code: EnvironmentExceptionCode) {
    super(message, code);
  }
}

export enum EnvironmentExceptionCode {
  ENVIRONMENT_VARIABLES_NOT_FOUND = 'ENVIRONMENT_VARIABLES_NOT_FOUND',
}
