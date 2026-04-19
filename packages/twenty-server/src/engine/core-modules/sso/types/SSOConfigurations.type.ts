/* @license Enterprise */

import {
  type IdentityProviderType,
  type SsoIdentityProviderStatus,
} from 'src/engine/core-modules/Sso/workspace-Sso-identity-provider.entity';

type CommonSsoConfiguration = {
  id: string;
  issuer: string;
  name?: string;
  status: SsoIdentityProviderStatus;
};

export type OidcConfiguration = {
  type: IdentityProviderType.Oidc;
  clientId: string;
  clientSecret: string;
} & CommonSsoConfiguration;

export type SamlConfiguration = {
  type: IdentityProviderType.Saml;
  ssoUrl: string;
  certificate: string;
  fingerprint?: string;
} & CommonSsoConfiguration;

export type SsoConfiguration = OidcConfiguration | SamlConfiguration;
