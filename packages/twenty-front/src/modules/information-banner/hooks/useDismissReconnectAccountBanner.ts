import { useMutation } from '@apollo/client';

import { DISMISS_RECONNECT_ACCOUNT_BANNER } from '@/information-banner/graphql/mutations/dismissReconnectAccountBanner';
import { informationBannerIsOpenComponentState } from '@/information-banner/states/informationBannerIsOpenComponentState';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';

type DismissReconnectAccountBannerMutationVariables = {
  connectedAccountId: string;
};

type DismissReconnectAccountBannerMutation = {
  dismissReconnectAccountBanner: boolean;
};

export const useDismissReconnectAccountBanner = (
  componentInstanceId: string,
) => {
  const apolloCoreClient = useApolloCoreClient();

  const [mutate] = useMutation<
    DismissReconnectAccountBannerMutation,
    DismissReconnectAccountBannerMutationVariables
  >(DISMISS_RECONNECT_ACCOUNT_BANNER, {
    client: apolloCoreClient,
  });

  const setInformationBannerIsOpenComponent = useSetRecoilComponentState(
    informationBannerIsOpenComponentState,
    componentInstanceId,
  );

  const dismissReconnectAccountBanner = async (connectedAccountId: string) => {
    await mutate({
      variables: {
        connectedAccountId,
      },
    });
    setInformationBannerIsOpenComponent(false);
  };

  return {
    dismissReconnectAccountBanner,
  };
};
