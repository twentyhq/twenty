import { type GraphQLFormattedError } from 'graphql';

// Guards that throw before the UNAUTHENTICATED code is attached reach the
// client as a bare "Unauthorized" message.
export const isUnauthenticatedGraphQLError = (
  graphQLError: GraphQLFormattedError,
): boolean =>
  graphQLError.extensions?.code === 'UNAUTHENTICATED' ||
  graphQLError.message === 'Unauthorized';
