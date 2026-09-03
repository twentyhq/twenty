/* @license Enterprise */

import { ssoIdentitiesProvidersState } from '@/settings/security/states/ssoIdentitiesProvidersState';
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
    ssoIdentitiesProvidersState,
  );

  const deleteSsoIdentityProvider = async ({
    identityProviderId,
  }: DeleteSsoIdentityProviderMutationVariables['input']) => {
    return await deleteSsoIdentityProviderMutation({
      variables: {
        input: { identityProviderId },
      },
      onCompleted: (data) => {
        setSsoIdentitiesProviders((ssoIdentitiesProviders) =>
          ssoIdentitiesProviders.filter(
            (identityProvider) =>
              identityProvider.id !==
              data.deleteSSOIdentityProvider.identityProviderId,
          ),
        );
      },
    });
  };

  return {
    deleteSsoIdentityProvider,
  };
};
