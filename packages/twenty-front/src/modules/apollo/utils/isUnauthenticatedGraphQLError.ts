import { type GraphQLFormattedError } from 'graphql';

// Guards that throw before UNAUTHENTICATED is attached reach the client as a bare "Unauthorized".
export const isUnauthenticatedGraphQLError = (
  graphQLError: GraphQLFormattedError,
): boolean =>
  graphQLError.extensions?.code === 'UNAUTHENTICATED' ||
  graphQLError.message === 'Unauthorized';
