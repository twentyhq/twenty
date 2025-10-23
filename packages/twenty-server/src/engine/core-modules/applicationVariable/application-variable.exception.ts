import { CustomException } from 'src/utils/custom-exception';

export class ApplicationVariableException extends CustomException<ApplicationVariableExceptionCode> {}

export enum ApplicationVariableExceptionCode {
  APPLICATION_VARIABLE_NOT_FOUND = 'APPLICATION_VARIABLE_NOT_FOUND',
}
