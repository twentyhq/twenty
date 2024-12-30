import { CustomException } from 'src/utils/custom-exception';

export class UserException extends CustomException {
  constructor(message: string, code: UserExceptionCode) {
    super(message, code);
  }
}

export enum UserExceptionCode {
  USER_NOT_FOUND = 'USER_NOT_FOUND',
}
