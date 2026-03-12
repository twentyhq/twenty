import { useQuery } from '@apollo/client/react';
import { useEffect } from 'react';
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
  });

  useEffect(() => {
    if (data) {
      onCompleted?.(data.getConnectedImapSmtpCaldavAccount);
    }
  }, [data, onCompleted]);

  return {
    connectedAccount: data?.getConnectedImapSmtpCaldavAccount,
    loading,
    error,
  };
};
