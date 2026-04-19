/* @license Enterprise */

import { type SettingSecurityNewSsoIdentityFormValues } from '@/settings/security/types/SsoIdentityProvider';
import { v4 } from 'uuid';
import { type IdentityProviderType } from '~/generated-metadata/graphql';

export const SsoIdentityProviderDefaultValues: Record<
  IdentityProviderType,
  () => SettingSecurityNewSsoIdentityFormValues
> = {
  Saml: () => ({
    type: 'Saml',
    ssoUrl: '',
    name: '',
    id: v4(),
    certificate: '',
    issuer: '',
  }),
  Oidc: () => ({
    type: 'Oidc',
    name: '',
    clientId: '',
    clientSecret: '',
    issuer: '',
  }),
};
