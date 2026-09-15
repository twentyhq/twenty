/* @license Enterprise */

import { ssoIdentitiesProvidersState } from '@/settings/security/states/ssoIdentitiesProvidersState';
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
    ssoIdentitiesProvidersState,
  );

  const createSsoIdentityProvider = async (
    input:
      | ({
          type: 'OIDC';
        } & CreateOidcIdentityProviderMutationVariables['input'])
      | ({
          type: 'SAML';
        } & CreateSamlIdentityProviderMutationVariables['input']),
  ) => {
    if (input.type === 'OIDC') {
      // oxlint-disable-next-line unused-imports/no-unused-vars
      const { type, ...params } = input;
      return await createOidcIdentityProviderMutation({
        variables: { input: params },
        onCompleted: (data) => {
          setSsoIdentitiesProviders((existingProvider) => [
            ...existingProvider,
            data.createOIDCIdentityProvider,
          ]);
        },
      });
    } else if (input.type === 'SAML') {
      // oxlint-disable-next-line unused-imports/no-unused-vars
      const { type, ...params } = input;
      return await createSamlIdentityProviderMutation({
        variables: { input: params },
        onCompleted: (data) => {
          setSsoIdentitiesProviders((existingProvider) => [
            ...existingProvider,
            data.createSAMLIdentityProvider,
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
