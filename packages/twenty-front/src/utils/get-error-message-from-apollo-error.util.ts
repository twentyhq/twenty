import { ApolloError } from '@apollo/client';

export const getErrorMessageFromApolloError = (error: ApolloError): string => {
  if (!(error instanceof ApolloError)) {
    return 'An error occurred';
  }

  return (
    (error.graphQLErrors[0].extensions?.displayedErrorMessage as string) ??
    'An error occurred'
  );
};
