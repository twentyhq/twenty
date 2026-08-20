import { type GraphQLFormattedError } from 'graphql';

// Matched on the message, not the code alone: a permission denial is also
// FORBIDDEN but carries the message its exception set, whereas "Forbidden
// resource" is Nest's default for a guard rejecting an unhydrated request.
export const isMissingCredentialGraphQLError = (
  graphQLError: GraphQLFormattedError,
): boolean =>
  graphQLError.extensions?.code === 'FORBIDDEN' &&
  graphQLError.message === 'Forbidden resource';
