/* @license Enterprise */

import { SSOIdentitiesProvidersState } from '@/settings/security/states/SSOIdentitiesProvidersState';
import { useSetRecoilState } from 'recoil';
import {
  EditSsoIdentityProviderMutationVariables,
  useEditSsoIdentityProviderMutation,
} from '~/generated/graphql';

export const useUpdateSSOIdentityProvider = () => {
  const [editSsoIdentityProviderMutation] =
    useEditSsoIdentityProviderMutation();

  const setSSOIdentitiesProviders = useSetRecoilState(
    SSOIdentitiesProvidersState,
  );

  const updateSSOIdentityProvider = async (
    payload: EditSsoIdentityProviderMutationVariables['input'],
  ) => {
    return await editSsoIdentityProviderMutation({
      variables: {
        input: payload,
      },
      onCompleted: (data) => {
        setSSOIdentitiesProviders((SSOIdentitiesProviders) =>
          SSOIdentitiesProviders.map((identityProvider) =>
            identityProvider.id === data.editSSOIdentityProvider.id
              ? data.editSSOIdentityProvider
              : identityProvider,
          ),
        );
      },
    });
  };

  return {
    updateSSOIdentityProvider,
  };
};
