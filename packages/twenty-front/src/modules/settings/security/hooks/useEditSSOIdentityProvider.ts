import { useSetRecoilState } from 'recoil';
import { SSOIdentitiesProvidersState } from '@/settings/security/states/SSOIdentitiesProviders.state';
import {
  EditSsoIdentityProviderMutationVariables,
  useEditSsoIdentityProviderMutation,
} from '~/generated/graphql';

export const useEditSSOIdentityProvider = () => {
  const [editSsoIdentityProviderMutation] =
    useEditSsoIdentityProviderMutation();

  const setSSOIdentitiesProviders = useSetRecoilState(
    SSOIdentitiesProvidersState,
  );

  const editSSOIdentityProvider = async (
    payload: EditSsoIdentityProviderMutationVariables['input'],
  ) => {
    return await editSsoIdentityProviderMutation({
      variables: {
        input: payload,
      },
      onCompleted: (data) => {
        setSSOIdentitiesProviders((SSOIdentitiesProviders) =>
          SSOIdentitiesProviders.map((idp) =>
            idp.id === data.editSSOIdentityProvider.id
              ? data.editSSOIdentityProvider
              : idp,
          ),
        );
      },
    });
  };

  return {
    editSSOIdentityProvider,
  };
};
