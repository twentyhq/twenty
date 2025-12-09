import { type ApolloError } from '@apollo/client';
import { type MessageDescriptor } from '@lingui/core';
import { t } from '@lingui/core/macro';
import { type Nullable } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export const getErrorMessageFromApolloError = (error: ApolloError): string => {
  const userFriendlyMessage = error.graphQLErrors?.[0]?.extensions
    ?.userFriendlyMessage as Nullable<MessageDescriptor | string>;

  if (!isDefined(userFriendlyMessage)) {
    return t`An error occurred.`;
  }

  if (typeof userFriendlyMessage === 'object' && 'id' in userFriendlyMessage) {
    return t(userFriendlyMessage);
  }

  return userFriendlyMessage;
};
