/* @license Enterprise */

import { ssoIdentitiesProvidersState } from '@/settings/security/states/ssoIdentitiesProvidersState';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { useMutation } from '@apollo/client/react';
import {
  type EditSsoIdentityProviderMutationVariables,
  EditSsoIdentityProviderDocument,
} from '~/generated-metadata/graphql';

export const useUpdateSsoIdentityProvider = () => {
  const [editSsoIdentityProviderMutation] = useMutation(
    EditSsoIdentityProviderDocument,
  );

  const setSsoIdentitiesProviders = useSetAtomState(
    ssoIdentitiesProvidersState,
  );

  const updateSsoIdentityProvider = async (
    payload: EditSsoIdentityProviderMutationVariables['input'],
  ) => {
    return await editSsoIdentityProviderMutation({
      variables: {
        input: payload,
      },
      onCompleted: (data) => {
        setSsoIdentitiesProviders((ssoIdentitiesProviders) =>
          ssoIdentitiesProviders.map((identityProvider) =>
            identityProvider.id === data.editSSOIdentityProvider.id
              ? data.editSSOIdentityProvider
              : identityProvider,
          ),
        );
      },
    });
  };

  return {
    updateSsoIdentityProvider,
  };
};
