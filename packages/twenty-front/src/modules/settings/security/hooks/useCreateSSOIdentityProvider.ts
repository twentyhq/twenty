import { useSetRecoilState } from 'recoil';
import {
  CreateOidcIdentityProviderMutationVariables,
  CreateSamlIdentityProviderMutationVariables,
  IdpType,
  useCreateOidcIdentityProviderMutation,
  useCreateSamlIdentityProviderMutation,
} from '~/generated/graphql';
import { SSOIdentitiesProvidersState } from '@/settings/security/states/SSOIdentitiesProviders.state';

export const useCreateSSOIdentityProvider = () => {
  const [createOidcIdentityProviderMutation] =
    useCreateOidcIdentityProviderMutation();
  const [createSamlIdentityProviderMutation] =
    useCreateSamlIdentityProviderMutation();

  const setSSOIdentitiesProviders = useSetRecoilState(
    SSOIdentitiesProvidersState,
  );

  const createSSOIdentityProvider = async <T extends IdpType>({
    type,
    input,
  }: T extends 'OIDC'
    ? {
        type: 'OIDC';
        input: CreateOidcIdentityProviderMutationVariables['input'];
      }
    : {
        type: 'SAML';
        input: CreateSamlIdentityProviderMutationVariables['input'];
      }) => {
    if (type === 'OIDC') {
      return await createOidcIdentityProviderMutation({
        variables: { input },
        onCompleted: (data) => {
          setSSOIdentitiesProviders((existingProvider) => [
            ...existingProvider,
            data.createOIDCIdentityProvider,
          ]);
        },
      });
    } else if (type === 'SAML') {
      return await createSamlIdentityProviderMutation({
        variables: { input },
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
