import { useSetRecoilState } from 'recoil';
import { SSOIdentitiesProvidersState } from '@/settings/security/states/SSOIdentitiesProviders.state';
import {
  DeleteSsoIdentityProviderMutationVariables,
  useDeleteSsoIdentityProviderMutation,
} from '~/generated/graphql';

export const useDeleteSSOIdentityProvider = () => {
  const [deleteSsoIdentityProviderMutation] =
    useDeleteSsoIdentityProviderMutation();

  const setSSOIdentitiesProviders = useSetRecoilState(
    SSOIdentitiesProvidersState,
  );

  const deleteSSOIdentityProvider = async ({
    idpId,
  }: DeleteSsoIdentityProviderMutationVariables['input']) => {
    return await deleteSsoIdentityProviderMutation({
      variables: {
        input: { idpId },
      },
      onCompleted: (data) => {
        setSSOIdentitiesProviders((SSOIdentitiesProviders) =>
          SSOIdentitiesProviders.filter(
            (idp) => idp.id !== data.deleteSSOIdentityProvider.idpId,
          ),
        );
      },
    });
  };

  return {
    deleteSSOIdentityProvider,
  };
};
