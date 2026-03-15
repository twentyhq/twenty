/* @license Enterprise */

import { SSOIdentitiesProvidersState } from '@/settings/security/states/SSOIdentitiesProvidersState';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { useMutation } from '@apollo/client/react';
import {
  type EditSsoIdentityProviderMutationVariables,
  EditSsoIdentityProviderDocument,
} from '~/generated-metadata/graphql';

export const useUpdateSSOIdentityProvider = () => {
  const [editSsoIdentityProviderMutation] = useMutation(
    EditSsoIdentityProviderDocument,
  );

  const setSSOIdentitiesProviders = useSetAtomState(
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
