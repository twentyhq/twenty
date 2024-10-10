import {
  IdpType,
  SSOIdentityProviderStatus,
} from 'src/engine/core-modules/sso/workspace-sso-identity-provider.entity';

type CommonSSOConfiguration = {
  id: string;
  issuer: string;
  name?: string;
  status: SSOIdentityProviderStatus;
};

export type OIDCConfiguration = {
  type: IdpType.OIDC;
  clientID: string;
  clientSecret: string;
} & CommonSSOConfiguration;

export type SAMLConfiguration = {
  type: IdpType.SAML;
  ssoURL: string;
  certificate: string;
  fingerprint?: string;
} & CommonSSOConfiguration;

export type SSOConfiguration = OIDCConfiguration | SAMLConfiguration;
