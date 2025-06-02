import { ApolloError } from '@apollo/client';

export const getErrorMessage = (error: any) => {
  return error instanceof ApolloError
    ? error.graphQLErrors[0].extensions?.errorFrontEndMessage
    : error.message;
};
