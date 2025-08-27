/* @license Enterprise */

import { type SettingSecurityNewSSOIdentityFormValues } from '@/settings/security/types/SSOIdentityProvider';
import { v4 } from 'uuid';
import { type IdentityProviderType } from '~/generated/graphql';

export const sSOIdentityProviderDefaultValues: Record<
  IdentityProviderType,
  () => SettingSecurityNewSSOIdentityFormValues
> = {
  SAML: () => ({
    type: 'SAML',
    ssoURL: '',
    name: '',
    id: v4(),
    certificate: '',
    issuer: '',
  }),
  OIDC: () => ({
    type: 'OIDC',
    name: '',
    clientID: '',
    clientSecret: '',
    issuer: '',
  }),
};
