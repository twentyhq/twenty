import { assertUnreachable } from 'twenty-shared/utils';

import {
  NotFoundError,
  UserInputError,
} from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import {
  PageLayoutTabException,
  PageLayoutTabExceptionCode,
} from 'src/engine/core-modules/page-layout/exceptions/page-layout-tab.exception';
import {
  PageLayoutWidgetException,
  PageLayoutWidgetExceptionCode,
} from 'src/engine/core-modules/page-layout/exceptions/page-layout-widget.exception';
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
      default: {
        return assertUnreachable(error.code);
      }
    }
  }

  if (error instanceof PageLayoutWidgetException) {
    switch (error.code) {
      case PageLayoutWidgetExceptionCode.PAGE_LAYOUT_WIDGET_NOT_FOUND:
        throw new NotFoundError(error.message);
      case PageLayoutWidgetExceptionCode.INVALID_PAGE_LAYOUT_WIDGET_DATA:
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
