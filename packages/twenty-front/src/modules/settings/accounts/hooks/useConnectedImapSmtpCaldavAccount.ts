import { useGetConnectedImapSmtpCaldavAccountQuery } from '~/generated-metadata/graphql';

export const useConnectedImapSmtpCaldavAccount = (
  connectedAccountId: string | undefined,
) => {
  const { data, loading, error } = useGetConnectedImapSmtpCaldavAccountQuery({
    variables: { id: connectedAccountId ?? '' },
    skip: !connectedAccountId,
  });

  return {
    connectedAccount: data?.getConnectedImapSmtpCaldavAccount,
    loading,
    error,
  };
};
