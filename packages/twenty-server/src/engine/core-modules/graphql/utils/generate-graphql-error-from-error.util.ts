import { type I18n } from '@lingui/core';
import { msg } from '@lingui/core/macro';

import {
  BaseGraphQLError,
  ErrorCode,
} from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { CustomException } from 'src/utils/custom-exception';

export const generateGraphQLErrorFromError = (
  error: Error | CustomException,
  i18n: I18n,
) => {
  const graphqlError = new BaseGraphQLError(
    error.message,
    ErrorCode.INTERNAL_SERVER_ERROR,
  );

  const defaultErrorMessage = msg`An error occurred.`;

  if (error instanceof CustomException) {
    graphqlError.extensions.userFriendlyMessage = i18n._(
      error.userFriendlyMessage ?? defaultErrorMessage,
    );
  } else {
    graphqlError.extensions.userFriendlyMessage = i18n._(defaultErrorMessage);
  }

  return graphqlError;
};
