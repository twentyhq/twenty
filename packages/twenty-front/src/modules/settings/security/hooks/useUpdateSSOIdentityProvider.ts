/* @license Enterprise */

import { SSOIdentitiesProvidersState } from '@/settings/security/states/SSOIdentitiesProvidersState';
import { useSetRecoilStateV2 } from '@/ui/utilities/state/jotai/hooks/useSetRecoilStateV2';
import {
  type EditSsoIdentityProviderMutationVariables,
  useEditSsoIdentityProviderMutation,
} from '~/generated-metadata/graphql';

export const useUpdateSSOIdentityProvider = () => {
  const [editSsoIdentityProviderMutation] =
    useEditSsoIdentityProviderMutation();

  const setSSOIdentitiesProviders = useSetRecoilStateV2(
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
