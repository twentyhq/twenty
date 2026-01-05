import {
  type GetConnectedWhatsappAccountQuery,
  useGetConnectedWhatsappAccountQuery,
} from '~/generated-metadata/graphql';

export type ConnectedWhatsappAccount =
  GetConnectedWhatsappAccountQuery['getConnectedWhatsappAccount'];

export const useConnectedWhatsappAccount = (
  connectedAccountId: string | undefined,
  businessAccountId: string | undefined,
  onCompleted?: (data: ConnectedWhatsappAccount) => void,
) => {
  const { data, loading, error } = useGetConnectedWhatsappAccountQuery({
    variables: {
      connectedAccountId: connectedAccountId ?? '',
      businessAccountId: businessAccountId ?? '',
    },
    skip: !connectedAccountId,
    onCompleted: (data) => {
      onCompleted?.(data.getConnectedWhatsappAccount);
    },
  });

  return {
    connectedAccount: data?.getConnectedWhatsappAccount,
    loading,
    error,
  };
};
