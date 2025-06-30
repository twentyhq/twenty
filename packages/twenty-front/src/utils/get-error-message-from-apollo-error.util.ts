import { ApolloError } from '@apollo/client';
import { DEFAULT_DISPLAYED_ERROR_MESSAGE } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';

export const getErrorMessageFromApolloError = (error: ApolloError): string => {
  if (!isDefined(error.graphQLErrors?.[0]?.extensions?.displayedErrorMessage)) {
    return DEFAULT_DISPLAYED_ERROR_MESSAGE;
  }

  return (
    (error.graphQLErrors[0].extensions?.displayedErrorMessage as string) ??
    DEFAULT_DISPLAYED_ERROR_MESSAGE
  );
};
