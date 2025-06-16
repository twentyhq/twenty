import { ConnectedAccountProvider } from 'twenty-shared/types';
import { useGetConnectedImapAccountQuery } from '~/generated/graphql';

export const useConnectedIMAPAccount = (connectedAccountId: string | undefined) => {
  const { data, loading, error } = useGetConnectedImapAccountQuery({
    variables: { id: connectedAccountId ?? '' },
    skip: !connectedAccountId,
  });

  const isImapAccount =
    data?.getConnectedImapAccount?.provider === ConnectedAccountProvider.IMAP;

  return {
    connectedAccount: data?.getConnectedImapAccount,
    isImapAccount,
    loading,
    error,
  };
};
