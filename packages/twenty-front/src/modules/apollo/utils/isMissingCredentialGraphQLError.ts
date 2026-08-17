import { type GraphQLFormattedError } from 'graphql';

// A request the server could not authenticate at all -- no Bearer header and no
// readable session cookie -- never reaches the auth layer: the token middleware
// skips hydration and the workspace guard rejects the unhydrated request, which
// Nest reports as its default "Forbidden resource".
//
// Matched on the message and not on the code alone: a genuine permission denial
// is also FORBIDDEN, but carries the message the raising exception set.
export const isMissingCredentialGraphQLError = (
  graphQLError: GraphQLFormattedError,
): boolean =>
  graphQLError.extensions?.code === 'FORBIDDEN' &&
  graphQLError.message === 'Forbidden resource';
