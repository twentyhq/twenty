import {
  ApiKeyException,
  ApiKeyExceptionCode,
} from 'src/engine/core-modules/api-key/api-key.exception';
import {
  ForbiddenError,
  NotFoundError,
  UserInputError,
} from 'src/engine/core-modules/graphql/utils/graphql-errors.util';

export const apiKeyGraphqlApiExceptionHandler = (error: Error) => {
  if (error instanceof ApiKeyException) {
    switch (error.code) {
      case ApiKeyExceptionCode.API_KEY_NOT_FOUND:
        throw new NotFoundError(error.message);
      case ApiKeyExceptionCode.API_KEY_REVOKED:
        throw new ForbiddenError(error.message, {
          userFriendlyMessage: error.userFriendlyMessage,
        });
      case ApiKeyExceptionCode.API_KEY_EXPIRED:
        throw new UserInputError(error.message, {
          userFriendlyMessage: error.userFriendlyMessage,
        });
      case ApiKeyExceptionCode.API_KEY_NO_ROLE_ASSIGNED:
        throw new ForbiddenError(error.message, {
          userFriendlyMessage: error.userFriendlyMessage,
        });
      default: {
        const _exhaustiveCheck: never = error.code;

        throw error;
      }
    }
  }

  throw error;
};
