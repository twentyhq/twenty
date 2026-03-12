import { useQuery } from '@apollo/client/react';
import {
  type GetConnectedImapSmtpCaldavAccountQuery,
  GetConnectedImapSmtpCaldavAccountDocument,
} from '~/generated-metadata/graphql';

export type ConnectedImapSmtpCaldavAccount =
  GetConnectedImapSmtpCaldavAccountQuery['getConnectedImapSmtpCaldavAccount'];

export const useConnectedImapSmtpCaldavAccount = (
  connectedAccountId: string | undefined,
  onCompleted?: (data: ConnectedImapSmtpCaldavAccount) => void,
) => {
  const { data, loading, error } = useQuery(GetConnectedImapSmtpCaldavAccountDocument, {
    variables: { id: connectedAccountId ?? '' },
    skip: !connectedAccountId,
    onCompleted: (data) => {
      onCompleted?.(data.getConnectedImapSmtpCaldavAccount);
    },
  });

  return {
    connectedAccount: data?.getConnectedImapSmtpCaldavAccount,
    loading,
    error,
  };
};
