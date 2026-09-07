/* @license Enterprise */

import { type SettingSecurityNewSsoIdentityFormValues } from '@/settings/security/types/SsoIdentityProvider';
import { v4 } from 'uuid';
import { type IdentityProviderType } from '~/generated-metadata/graphql';

export const ssoIdentityProviderDefaultValues: Record<
  IdentityProviderType,
  () => SettingSecurityNewSsoIdentityFormValues
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
