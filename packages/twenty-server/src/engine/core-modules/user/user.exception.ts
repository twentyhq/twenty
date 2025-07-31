import { CustomException } from 'src/utils/custom-exception';

export class UserException extends CustomException<UserExceptionCode> {}

export enum UserExceptionCode {
  USER_NOT_FOUND = 'USER_NOT_FOUND',
}
