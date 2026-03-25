/* @license Enterprise */

import {
  type IdentityProviderType,
  type SSOIdentityProviderStatus,
} from 'src/engine/core-modules/sso/workspace-sso-identity-provider.entity';

type CommonSSOConfiguration = {
  id: string;
  issuer: string;
  name?: string;
  status: SSOIdentityProviderStatus;
};

export type OIDCConfiguration = {
  type: IdentityProviderType.OIDC;
  clientID: string;
  clientSecret: string;
} & CommonSSOConfiguration;

export type SAMLConfiguration = {
  type: IdentityProviderType.SAML;
  ssoURL: string;
  certificate: string;
  fingerprint?: string;
} & CommonSSOConfiguration;

export type SSOConfiguration = OIDCConfiguration | SAMLConfiguration;
