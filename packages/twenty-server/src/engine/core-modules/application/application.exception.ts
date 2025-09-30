import { CustomException } from 'src/utils/custom-exception';

export class ApplicationException extends CustomException<ApplicationExceptionCode> {}

export enum ApplicationExceptionCode {
  OBJECT_NOT_FOUND = 'OBJECT_NOT_FOUND',
}
