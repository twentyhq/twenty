import { CombinedGraphQLErrors } from '@apollo/client/errors';

export const isApplicationNotFoundError = (error: unknown): boolean =>
  CombinedGraphQLErrors.is(error) &&
  error.errors.some(
    (graphQLError) => graphQLError.extensions?.code === 'NOT_FOUND',
  );
