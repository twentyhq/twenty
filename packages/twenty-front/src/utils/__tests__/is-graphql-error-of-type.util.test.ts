import { CombinedGraphQLErrors } from '@apollo/client/errors';

import { isGraphqlErrorOfType } from '~/utils/is-graphql-error-of-type.util';

const createCombinedGraphQLError = (
  errors: Array<{
    message: string;
    extensions?: Record<string, unknown>;
  }>,
): CombinedGraphQLErrors => new CombinedGraphQLErrors({ errors, data: null });

describe('isGraphqlErrorOfType', () => {
  it('matches a subCode from an Apollo GraphQL error', () => {
    const error = createCombinedGraphQLError([
      {
        message: 'Credits exhausted',
        extensions: {
          code: 'FORBIDDEN',
          subCode: 'BILLING_CREDITS_EXHAUSTED',
        },
      },
    ]);

    expect(isGraphqlErrorOfType(error, 'BILLING_CREDITS_EXHAUSTED')).toBe(true);
  });

  it('matches the GraphQL code when no subCode is present', () => {
    const error = createCombinedGraphQLError([
      {
        message: 'Unauthorized',
        extensions: {
          code: 'UNAUTHENTICATED',
        },
      },
    ]);

    expect(isGraphqlErrorOfType(error, 'UNAUTHENTICATED')).toBe(true);
  });

  it('matches a plain error code property', () => {
    const error = new Error('Stream failed') as Error & { code: string };

    error.code = 'AGENT_EXECUTION_FAILED';

    expect(isGraphqlErrorOfType(error, 'AGENT_EXECUTION_FAILED')).toBe(true);
  });

  it('matches a subCode from a plain GraphQLFormattedError object', () => {
    const error = {
      message: 'Refresh token expired',
      extensions: {
        subCode: 'APPLICATION_REFRESH_TOKEN_INVALID_OR_EXPIRED',
      },
    };

    expect(
      isGraphqlErrorOfType(
        error,
        'APPLICATION_REFRESH_TOKEN_INVALID_OR_EXPIRED',
      ),
    ).toBe(true);
  });

  it('returns false when the error code does not match', () => {
    const error = createCombinedGraphQLError([
      {
        message: 'Unauthorized',
        extensions: {
          code: 'UNAUTHENTICATED',
        },
      },
    ]);

    expect(isGraphqlErrorOfType(error, 'FORBIDDEN')).toBe(false);
  });
});
