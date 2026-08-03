import { type GraphQLFormattedError } from 'graphql';

// The server marks an authentication rejection with the UNAUTHENTICATED code,
// but a bare "Unauthorized" message reaches the client too, from guards that
// throw before the code is attached. Both forms are recognised in one place so
// the error link and the cookie session probe cannot disagree about whether a
// given response means the credential was refused.
export const isUnauthenticatedGraphQLError = (
  graphQLError: GraphQLFormattedError,
): boolean =>
  graphQLError.extensions?.code === 'UNAUTHENTICATED' ||
  graphQLError.message === 'Unauthorized';
