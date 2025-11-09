import { CustomException } from 'src/utils/custom-exception';

export class UserException extends CustomException<UserExceptionCode> {}

export enum UserExceptionCode {
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  EMAIL_ALREADY_IN_USE = 'EMAIL_ALREADY_IN_USE',
  EMAIL_UNCHANGED = 'EMAIL_UNCHANGED',
  EMAIL_UPDATE_RESTRICTED_TO_SINGLE_WORKSPACE = 'EMAIL_UPDATE_RESTRICTED_TO_SINGLE_WORKSPACE',
}
