import { type GraphQLFormattedError } from 'graphql';

// A bare "Unauthorized" message reaches the client alongside the UNAUTHENTICATED
// code, from guards that throw before the code is attached. Recognised in one
// place so the error link and the session probe cannot disagree.
export const isUnauthenticatedGraphQLError = (
  graphQLError: GraphQLFormattedError,
): boolean =>
  graphQLError.extensions?.code === 'UNAUTHENTICATED' ||
  graphQLError.message === 'Unauthorized';
