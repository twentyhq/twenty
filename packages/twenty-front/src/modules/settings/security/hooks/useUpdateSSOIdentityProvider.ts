/* @license Enterprise */

import { SsoIdentitiesProvidersState } from '@/settings/security/states/SsoIdentitiesProvidersState';
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
    SsoIdentitiesProvidersState,
  );

  const updateSsoIdentityProvider = async (
    payload: EditSsoIdentityProviderMutationVariables['input'],
  ) => {
    return await editSsoIdentityProviderMutation({
      variables: {
        input: payload,
      },
      onCompleted: (data) => {
        setSsoIdentitiesProviders((SsoIdentitiesProviders) =>
          SsoIdentitiesProviders.map((identityProvider) =>
            identityProvider.id === data.editSsoIdentityProvider.id
              ? data.editSsoIdentityProvider
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
