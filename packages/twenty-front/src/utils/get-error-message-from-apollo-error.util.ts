import { ApolloError } from '@apollo/client';
import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

export const getErrorMessageFromApolloError = (error: ApolloError): string => {
  if (!isDefined(error.graphQLErrors?.[0]?.extensions?.userFriendlyMessage)) {
    return t`An error occurred.`;
  }

  return (
    (error.graphQLErrors[0].extensions?.userFriendlyMessage as string) ??
    t`An error occurred.`
  );
};
