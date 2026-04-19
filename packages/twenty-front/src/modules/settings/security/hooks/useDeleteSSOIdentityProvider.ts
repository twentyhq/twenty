/* @license Enterprise */

import { SsoIdentitiesProvidersState } from '@/settings/security/states/SsoIdentitiesProvidersState';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { useMutation } from '@apollo/client/react';
import {
  type DeleteSsoIdentityProviderMutationVariables,
  DeleteSsoIdentityProviderDocument,
} from '~/generated-metadata/graphql';

export const useDeleteSsoIdentityProvider = () => {
  const [deleteSsoIdentityProviderMutation] = useMutation(
    DeleteSsoIdentityProviderDocument,
  );

  const setSsoIdentitiesProviders = useSetAtomState(
    SsoIdentitiesProvidersState,
  );

  const deleteSsoIdentityProvider = async ({
    identityProviderId,
  }: DeleteSsoIdentityProviderMutationVariables['input']) => {
    return await deleteSsoIdentityProviderMutation({
      variables: {
        input: { identityProviderId },
      },
      onCompleted: (data) => {
        setSsoIdentitiesProviders((SsoIdentitiesProviders) =>
          SsoIdentitiesProviders.filter(
            (identityProvider) =>
              identityProvider.id !==
              data.deleteSsoIdentityProvider.identityProviderId,
          ),
        );
      },
    });
  };

  return {
    deleteSsoIdentityProvider,
  };
};
