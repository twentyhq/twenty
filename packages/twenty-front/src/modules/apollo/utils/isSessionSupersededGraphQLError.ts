import { type GraphQLFormattedError } from 'graphql';

export const isSessionSupersededGraphQLError = (
  graphQLError: Pick<GraphQLFormattedError, 'extensions'>,
): boolean => graphQLError.extensions?.subCode === 'SESSION_SUPERSEDED';
