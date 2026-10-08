/* @license Enterprise */

import {
  type IdentityProviderType,
  type SsoIdentityProviderStatus,
} from 'src/engine/core-modules/sso/workspace-sso-identity-provider.entity';

type CommonSsoConfiguration = {
  id: string;
  issuer: string;
  name?: string;
  status: SsoIdentityProviderStatus;
};

export type OidcConfiguration = {
  type: IdentityProviderType.OIDC;
  clientID: string;
  clientSecret: string;
} & CommonSsoConfiguration;

export type SamlConfiguration = {
  type: IdentityProviderType.SAML;
  ssoURL: string;
  certificate: string;
  fingerprint?: string;
} & CommonSsoConfiguration;

export type SsoConfiguration = OidcConfiguration | SamlConfiguration;
