import { IdpType } from 'src/engine/core-modules/sso/workspace-sso-identity-provider.entity';

type CommonSSOConfiguration = {
  issuer: string;
  name?: string;
};

export type OIDCConfiguration = {
  type: IdpType.OIDC;
  authorizationURL: string;
  tokenURL: string;
  clientID: string;
  clientSecret: string;
  callbackURL: string;
} & CommonSSOConfiguration;

export type SAMLConfiguration = {
  type: IdpType.SAML;
  ssoURL: string;
  certificate: string;
  fingerprint?: string;
} & CommonSSOConfiguration;

export type SSOConfiguration = OIDCConfiguration | SAMLConfiguration;
