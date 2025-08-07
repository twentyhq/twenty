/* @license Enterprise */

import { SSOIdentitiesProvidersState } from '@/settings/security/states/SSOIdentitiesProvidersState';
import { useSetRecoilState } from 'recoil';
import {
  type CreateOidcIdentityProviderMutationVariables,
  type CreateSamlIdentityProviderMutationVariables,
  useCreateOidcIdentityProviderMutation,
  useCreateSamlIdentityProviderMutation,
} from '~/generated-metadata/graphql';

export const useCreateSSOIdentityProvider = () => {
  const [createOidcIdentityProviderMutation] =
    useCreateOidcIdentityProviderMutation();
  const [createSamlIdentityProviderMutation] =
    useCreateSamlIdentityProviderMutation();

  const setSSOIdentitiesProviders = useSetRecoilState(
    SSOIdentitiesProvidersState,
  );

  const createSSOIdentityProvider = async (
    input:
      | ({
          type: 'OIDC';
        } & CreateOidcIdentityProviderMutationVariables['input'])
      | ({
          type: 'SAML';
        } & CreateSamlIdentityProviderMutationVariables['input']),
  ) => {
    if (input.type === 'OIDC') {
      const { type: _type, ...params } = input;
      return await createOidcIdentityProviderMutation({
        variables: { input: params },
        onCompleted: (data) => {
          setSSOIdentitiesProviders((existingProvider) => [
            ...existingProvider,
            data.createOIDCIdentityProvider,
          ]);
        },
      });
    } else if (input.type === 'SAML') {
      const { type: _type, ...params } = input;
      return await createSamlIdentityProviderMutation({
        variables: { input: params },
        onCompleted: (data) => {
          setSSOIdentitiesProviders((existingProvider) => [
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
    createSSOIdentityProvider,
  };
};
