import { type I18n, type MessageDescriptor } from '@lingui/core';
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

  const translateUserMessage = (message: MessageDescriptor) => {
    // In some deployments the server build may not compile Lingui macros.
    // Calling i18n._(MessageDescriptor) in that case logs extremely loudly
    // (Railway can rate-limit logs). In production, fall back to the
    // default message/id instead of translating.
    if (process.env.NODE_ENV === 'production') {
      return message.message ?? message.id;
    }

    return i18n._(message);
  };

  if (error instanceof CustomException) {
    graphqlError.extensions.userFriendlyMessage = translateUserMessage(
      error.userFriendlyMessage ?? defaultErrorMessage,
    );
  } else {
    graphqlError.extensions.userFriendlyMessage = translateUserMessage(defaultErrorMessage);
  }

  return graphqlError;
};
