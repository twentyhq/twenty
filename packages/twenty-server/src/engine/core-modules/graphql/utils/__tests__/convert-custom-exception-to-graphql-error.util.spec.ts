import { msg } from '@lingui/core/macro';

import { convertCustomExceptionToGraphQLError } from 'src/engine/core-modules/graphql/utils/convert-custom-exception-to-graphql-error.util';
import { ErrorCode } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import {
  type ExceptionCategory,
  UnknownException,
} from 'src/utils/custom-exception';

const buildException = (category: ExceptionCategory) =>
  new UnknownException('Something went wrong', 'SOME_DOMAIN_CODE', {
    userFriendlyMessage: msg`Something went wrong.`,
    category,
  });

describe('convertCustomExceptionToGraphQLError', () => {
  it.each<[ExceptionCategory, string, ErrorCode]>([
    ['BAD_USER_INPUT', 'UserInputError', ErrorCode.BAD_USER_INPUT],
    ['UNAUTHENTICATED', 'AuthenticationError', ErrorCode.UNAUTHENTICATED],
    ['FORBIDDEN', 'ForbiddenError', ErrorCode.FORBIDDEN],
    ['NOT_FOUND', 'NotFoundError', ErrorCode.NOT_FOUND],
    ['CONFLICT', 'ConflictError', ErrorCode.CONFLICT],
    ['PAYLOAD_TOO_LARGE', 'UserInputError', ErrorCode.BAD_USER_INPUT],
    ['RATE_LIMITED', 'GraphQLError', ErrorCode.RATE_LIMITED],
    ['QUOTA_EXHAUSTED', 'GraphQLError', ErrorCode.QUOTA_EXHAUSTED],
    ['GATEWAY_TIMEOUT', 'TimeoutError', ErrorCode.TIMEOUT],
    ['BAD_GATEWAY', 'InternalServerError', ErrorCode.INTERNAL_SERVER_ERROR],
    [
      'INTERNAL_SERVER_ERROR',
      'InternalServerError',
      ErrorCode.INTERNAL_SERVER_ERROR,
    ],
  ])('maps %s to %s with code %s', (category, errorName, errorCode) => {
    const graphqlError = convertCustomExceptionToGraphQLError(
      buildException(category),
    );

    expect(graphqlError.name).toBe(errorName);
    expect(graphqlError.extensions.code).toBe(errorCode);
  });

  it('keeps the domain code as subCode along with the message and user-friendly message', () => {
    const exception = buildException('NOT_FOUND');

    const graphqlError = convertCustomExceptionToGraphQLError(exception);

    expect(graphqlError.message).toBe('Something went wrong');
    expect(graphqlError.extensions.subCode).toBe('SOME_DOMAIN_CODE');
    expect(graphqlError.extensions.userFriendlyMessage).toBe(
      exception.userFriendlyMessage,
    );
  });
});
