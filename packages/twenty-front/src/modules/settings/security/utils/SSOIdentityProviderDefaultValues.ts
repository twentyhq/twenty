import { IdpType } from '~/generated/graphql';
import { SettingSecurityNewSSOIdentityFormValues } from '@/settings/security/types/SSOIdentityProvider';

export const defaultIdpValues: Record<
  IdpType,
  () => SettingSecurityNewSSOIdentityFormValues
> = {
  OIDC: () => ({
    type: 'OIDC',
    name: '',
    clientID: '',
    clientSecret: '',
    issuer: '',
  }),
  SAML: () => ({
    type: 'SAML',
    ssoURL: '',
    name: '',
    id: crypto.randomUUID(),
    certificate: '',
    issuer: '',
  }),
};
