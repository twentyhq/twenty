/* @license Enterprise */

import { SSOIdentitiesProvidersState } from '@/settings/security/states/SSOIdentitiesProvidersState';
import { useSetRecoilStateV2 } from '@/ui/utilities/state/jotai/hooks/useSetRecoilStateV2';
import {
  type DeleteSsoIdentityProviderMutationVariables,
  useDeleteSsoIdentityProviderMutation,
} from '~/generated-metadata/graphql';

export const useDeleteSSOIdentityProvider = () => {
  const [deleteSsoIdentityProviderMutation] =
    useDeleteSsoIdentityProviderMutation();

  const setSSOIdentitiesProviders = useSetRecoilStateV2(
    SSOIdentitiesProvidersState,
  );

  const deleteSSOIdentityProvider = async ({
    identityProviderId,
  }: DeleteSsoIdentityProviderMutationVariables['input']) => {
    return await deleteSsoIdentityProviderMutation({
      variables: {
        input: { identityProviderId },
      },
      onCompleted: (data) => {
        setSSOIdentitiesProviders((SSOIdentitiesProviders) =>
          SSOIdentitiesProviders.filter(
            (identityProvider) =>
              identityProvider.id !==
              data.deleteSSOIdentityProvider.identityProviderId,
          ),
        );
      },
    });
  };

  return {
    deleteSSOIdentityProvider,
  };
};
