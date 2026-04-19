/* @license Enterprise */

import { SsoIdentitiesProvidersState } from '@/settings/security/states/SsoIdentitiesProvidersState';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { useMutation } from '@apollo/client/react';
import {
  type CreateOidcIdentityProviderMutationVariables,
  type CreateSamlIdentityProviderMutationVariables,
  CreateOidcIdentityProviderDocument,
  CreateSamlIdentityProviderDocument,
} from '~/generated-metadata/graphql';

export const useCreateSsoIdentityProvider = () => {
  const [createOidcIdentityProviderMutation] = useMutation(
    CreateOidcIdentityProviderDocument,
  );
  const [createSamlIdentityProviderMutation] = useMutation(
    CreateSamlIdentityProviderDocument,
  );

  const setSsoIdentitiesProviders = useSetAtomState(
    SsoIdentitiesProvidersState,
  );

  const createSsoIdentityProvider = async (
    input:
      | ({
          type: 'Oidc';
        } & CreateOidcIdentityProviderMutationVariables['input'])
      | ({
          type: 'Saml';
        } & CreateSamlIdentityProviderMutationVariables['input']),
  ) => {
    if (input.type === 'Oidc') {
      // oxlint-disable-next-line unused-imports/no-unused-vars
      const { type, ...params } = input;
      return await createOidcIdentityProviderMutation({
        variables: { input: params },
        onCompleted: (data) => {
          setSsoIdentitiesProviders((existingProvider) => [
            ...existingProvider,
            data.createOidcIdentityProvider,
          ]);
        },
      });
    } else if (input.type === 'Saml') {
      // oxlint-disable-next-line unused-imports/no-unused-vars
      const { type, ...params } = input;
      return await createSamlIdentityProviderMutation({
        variables: { input: params },
        onCompleted: (data) => {
          setSsoIdentitiesProviders((existingProvider) => [
            ...existingProvider,
            data.createSamlIdentityProvider,
          ]);
        },
      });
    } else {
      throw new Error('Invalid IdpType');
    }
  };

  return {
    createSsoIdentityProvider,
  };
};
