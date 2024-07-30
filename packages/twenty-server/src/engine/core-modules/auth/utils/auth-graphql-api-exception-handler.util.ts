import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import {
  ForbiddenError,
  InternalServerError,
  NotFoundError,
  UserInputError,
} from 'src/engine/core-modules/graphql/utils/graphql-errors.util';

export const authGraphqlApiExceptionHandler = (error: Error) => {
  if (error instanceof AuthException) {
    switch (error.code) {
      case AuthExceptionCode.USER_NOT_FOUND:
      case AuthExceptionCode.CLIENT_NOT_FOUND:
        throw new NotFoundError(error.message);
      case AuthExceptionCode.INVALID_INPUT:
        throw new UserInputError(error.message);
      case AuthExceptionCode.FORBIDDEN_EXCEPTION:
        throw new ForbiddenError(error.message);
      case AuthExceptionCode.INVALID_DATA:
      case AuthExceptionCode.INTERNAL_SERVER_ERROR:
      default:
        throw new InternalServerError(error.message);
    }
  }

  throw error;
};
