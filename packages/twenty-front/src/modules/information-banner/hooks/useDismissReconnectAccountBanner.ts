import { useMutation } from '@apollo/client';

import { DISMISS_RECONNECT_ACCOUNT_BANNER } from '@/information-banner/graphql/mutations/dismissReconnectAccountBanner';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';

type DismissReconnectAccountBannerMutationVariables = {
  connectedAccountId: string;
};

type DismissReconnectAccountBannerMutation = {
  dismissReconnectAccountBanner: boolean;
};

export const useDismissReconnectAccountBanner = () => {
  const apolloMetadataClient = useApolloCoreClient();

  const [mutate] = useMutation<
    DismissReconnectAccountBannerMutation,
    DismissReconnectAccountBannerMutationVariables
  >(DISMISS_RECONNECT_ACCOUNT_BANNER, {
    client: apolloMetadataClient,
  });

  const dismissReconnectAccountBanner = async (connectedAccountId: string) => {
    return await mutate({
      variables: {
        connectedAccountId,
      },
    });
  };

  return {
    dismissReconnectAccountBanner,
  };
};
