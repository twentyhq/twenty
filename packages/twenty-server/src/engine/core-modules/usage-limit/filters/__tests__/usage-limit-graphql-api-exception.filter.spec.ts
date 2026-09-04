import {
  type BaseGraphQLError,
  ErrorCode,
} from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import {
  UsageLimitException,
  UsageLimitExceptionCode,
} from 'src/engine/core-modules/usage-limit/exceptions/usage-limit.exception';
import { UsageLimitGraphqlApiExceptionFilter } from 'src/engine/core-modules/usage-limit/filters/usage-limit-graphql-api-exception.filter';

const catchAsGraphQLError = (exception: UsageLimitException) => {
  const filter = new UsageLimitGraphqlApiExceptionFilter();

  try {
    filter.catch(exception);
  } catch (graphqlError) {
    return graphqlError as BaseGraphQLError;
  }

  throw new Error('UsageLimitGraphqlApiExceptionFilter did not throw');
};

describe('UsageLimitGraphqlApiExceptionFilter', () => {
  it('surfaces an invalid limit as a user input error rather than a server error', () => {
    const graphqlError = catchAsGraphQLError(
      new UsageLimitException(
        'API speed limits cannot target the EMAIL_SEND operation',
        UsageLimitExceptionCode.LIMIT_INVALID,
      ),
    );

    expect(graphqlError.extensions.code).toBe(ErrorCode.BAD_USER_INPUT);
    expect(graphqlError.message).toBe(
      'API speed limits cannot target the EMAIL_SEND operation',
    );
  });

  it('surfaces a not-entitled limit as a forbidden error', () => {
    const graphqlError = catchAsGraphQLError(
      new UsageLimitException(
        'Intra-workspace usage limits require the Organization plan',
        UsageLimitExceptionCode.LIMIT_NOT_ENTITLED,
      ),
    );

    expect(graphqlError.extensions.code).toBe(ErrorCode.FORBIDDEN);
  });

  it('surfaces an exhausted quota through the shared enforcement mapping', () => {
    const graphqlError = catchAsGraphQLError(
      new UsageLimitException(
        'Quota exhausted',
        UsageLimitExceptionCode.QUOTA_EXHAUSTED,
      ),
    );

    expect(graphqlError.extensions.code).toBe(ErrorCode.QUOTA_EXHAUSTED);
  });
});
