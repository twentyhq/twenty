import { t } from '@lingui/core/macro';

import {
  BaseGraphQLError,
  ErrorCode,
} from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { CustomException } from 'src/utils/custom-exception';

export const generateGraphQLErrorFromError = (
  error: Error | CustomException,
) => {
  const graphqlError = new BaseGraphQLError(
    error.message,
    ErrorCode.INTERNAL_SERVER_ERROR,
  );

  if (error instanceof CustomException) {
    graphqlError.extensions.userFriendlyMessage =
      error.userFriendlyMessage ?? t`An error occurred.`;
  } else {
    graphqlError.extensions.userFriendlyMessage = t`An error occurred.`;
  }

  return graphqlError;
};
