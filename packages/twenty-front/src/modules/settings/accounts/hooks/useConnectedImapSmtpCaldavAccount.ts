import { useGetConnectedImap_Smtp_CaldevAccountQuery } from '~/generated/graphql';

export const useConnectedImapSmtpCaldavAccount = (
  connectedAccountId: string | undefined,
) => {
  const { data, loading, error } = useGetConnectedImap_Smtp_CaldevAccountQuery({
    variables: { id: connectedAccountId ?? '' },
    skip: !connectedAccountId,
  });

  return {
    connectedAccount: data?.getConnectedIMAP_SMTP_CALDEVAccount,
    loading,
    error,
  };
};
