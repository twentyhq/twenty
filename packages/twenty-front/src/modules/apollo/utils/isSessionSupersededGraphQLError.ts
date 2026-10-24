import { type GraphQLFormattedError } from 'graphql';

export const isSessionSupersededGraphQLError = (
  graphQLError: GraphQLFormattedError,
): boolean => graphQLError.extensions?.subCode === 'SESSION_SUPERSEDED';
