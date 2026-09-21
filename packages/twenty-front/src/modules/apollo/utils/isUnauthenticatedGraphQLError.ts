import { type GraphQLFormattedError } from 'graphql';

// Guards that throw before the UNAUTHENTICATED code is attached reach the
// client as a bare "Unauthorized" message or token expiration messages.
export const isUnauthenticatedGraphQLError = (
  graphQLError: GraphQLFormattedError,
): boolean =>
  graphQLError.extensions?.code === 'UNAUTHENTICATED' ||
  graphQLError.message === 'Unauthorized' ||
  graphQLError.message === 'Token has expired.' ||
  graphQLError.message === 'Token invalid.' ||
  graphQLError.message === 'You must be authenticated to perform this action.';
