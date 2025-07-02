import { ApolloError } from '@apollo/client';
import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

export const getErrorMessageFromApolloError = (error: ApolloError): string => {
  if (!isDefined(error.graphQLErrors?.[0]?.extensions?.displayedErrorMessage)) {
    return t`An error occurred.`;
  }

  return (
    (error.graphQLErrors[0].extensions?.displayedErrorMessage as string) ??
    t`An error occurred.`
  );
};
