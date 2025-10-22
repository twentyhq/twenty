import { CustomException } from 'src/utils/custom-exception';

export class ApplicationVariableEntityException extends CustomException<ApplicationVariableEntityExceptionCode> {}

export enum ApplicationVariableEntityExceptionCode {
  APPLICATION_VARIABLE_NOT_FOUND = 'APPLICATION_VARIABLE_NOT_FOUND',
}
