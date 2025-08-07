/* @license Enterprise */

import { SSOIdentitiesProvidersState } from '@/settings/security/states/SSOIdentitiesProvidersState';
import { useSetRecoilState } from 'recoil';
import {
  type DeleteSsoIdentityProviderMutationVariables,
  useDeleteSsoIdentityProviderMutation,
} from '~/generated-metadata/graphql';

export const useDeleteSSOIdentityProvider = () => {
  const [deleteSsoIdentityProviderMutation] =
    useDeleteSsoIdentityProviderMutation();

  const setSSOIdentitiesProviders = useSetRecoilState(
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
