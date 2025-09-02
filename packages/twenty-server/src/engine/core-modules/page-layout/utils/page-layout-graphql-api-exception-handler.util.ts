import { assertUnreachable } from 'twenty-shared/utils';

import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
  UserInputError,
} from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import {
  PageLayoutTabException,
  PageLayoutTabExceptionCode,
} from 'src/engine/core-modules/page-layout/exceptions/page-layout-tab.exception';
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

  if (error instanceof PageLayoutTabException) {
    switch (error.code) {
      case PageLayoutTabExceptionCode.PAGE_LAYOUT_TAB_NOT_FOUND:
        throw new NotFoundError(error.message);
      case PageLayoutTabExceptionCode.INVALID_PAGE_LAYOUT_TAB_DATA:
        throw new UserInputError(error.message, {
          userFriendlyMessage: error.userFriendlyMessage,
        });
      case PageLayoutTabExceptionCode.PAGE_LAYOUT_TAB_ALREADY_EXISTS:
        throw new ConflictError(error.message, {
          userFriendlyMessage: error.userFriendlyMessage,
        });
      case PageLayoutTabExceptionCode.PAGE_LAYOUT_TAB_NOT_DELETED:
        throw new ForbiddenError(error.message, {
          userFriendlyMessage: error.userFriendlyMessage,
        });
      case PageLayoutTabExceptionCode.PAGE_LAYOUT_NOT_FOUND:
        throw new NotFoundError(error.message);
      default: {
        return assertUnreachable(error.code);
      }
    }
  }

  throw error;
};
