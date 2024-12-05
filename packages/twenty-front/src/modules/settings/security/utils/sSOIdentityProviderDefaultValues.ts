/* @license Enterprise */

import { SettingSecurityNewSSOIdentityFormValues } from '@/settings/security/types/SSOIdentityProvider';
import { IdentityProviderType } from '~/generated/graphql';

export const sSOIdentityProviderDefaultValues: Record<
  IdentityProviderType,
  () => SettingSecurityNewSSOIdentityFormValues
> = {
  SAML: () => ({
    type: 'SAML',
    ssoURL: '',
    name: '',
    id:
      window.location.protocol === 'https:'
        ? crypto.randomUUID()
        : '10000000-1000-4000-8000-100000000000'.replace(/[018]/g, (c) =>
            (
              +c ^
              (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (+c / 4)))
            ).toString(16),
          ),
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
