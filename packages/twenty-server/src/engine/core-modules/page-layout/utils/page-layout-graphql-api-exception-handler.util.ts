import { assertUnreachable } from 'twenty-shared/utils';

import {
  NotFoundError,
  UserInputError,
} from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import {
  PageLayoutException,
  PageLayoutExceptionCode,
} from 'src/engine/core-modules/page-layout/exceptions/page-layout.exception';

export const pageLayoutGraphqlApiExceptionHandler = (error: Error) => {
  if (error instanceof PageLayoutException) {
    switch (error.code) {
      case PageLayoutExceptionCode.PAGE_LAYOUT_NOT_FOUND:
        throw new NotFoundError(error.message);
      case PageLayoutExceptionCode.INVALID_PAGE_LAYOUT_DATA:
        throw new UserInputError(error.message, {
          userFriendlyMessage: error.userFriendlyMessage,
        });
      default: {
        return assertUnreachable(error.code);
      }
    }
  }

  throw error;
};
