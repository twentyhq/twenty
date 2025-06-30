import {
  GetConnectedImapSmtpCaldavAccountQuery,
  useGetConnectedImapSmtpCaldavAccountQuery,
} from '~/generated/graphql';

export const useConnectedImapSmtpCaldavAccount = (
  connectedAccountId: string | undefined,
  onCompleted?: (
    data: GetConnectedImapSmtpCaldavAccountQuery['getConnectedImapSmtpCaldavAccount'],
  ) => void,
) => {
  const { data, loading, error } = useGetConnectedImapSmtpCaldavAccountQuery({
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
