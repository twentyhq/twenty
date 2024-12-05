/* @license Enterprise */

import { SSOIdentitiesProvidersState } from '@/settings/security/states/SSOIdentitiesProvidersState';
import { useSetRecoilState } from 'recoil';
import {
  CreateOidcIdentityProviderMutationVariables,
  CreateSamlIdentityProviderMutationVariables,
  useCreateOidcIdentityProviderMutation,
  useCreateSamlIdentityProviderMutation,
} from '~/generated/graphql';

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
      // eslint-disable-next-line unused-imports/no-unused-vars
      const { type, ...params } = input;
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
      // eslint-disable-next-line unused-imports/no-unused-vars
      const { type, ...params } = input;
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
