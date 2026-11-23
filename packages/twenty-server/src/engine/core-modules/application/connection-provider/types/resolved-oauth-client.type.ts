import { type OAuthProviderTokenRequestContentType } from 'twenty-shared/application';

export type OAuthTokenEndpointAuthMethod =
  | 'client_secret_post'
  | 'client_secret_basic'
  | 'none';

export type ResolvedOAuthClient = {
  authorizationEndpoint: string;
  tokenEndpoint: string;
  clientId: string;
  clientSecret: string | null;
  tokenEndpointAuthMethod: OAuthTokenEndpointAuthMethod;
  scopes: string[];
  resource: string | null;
  authorizationParams: Record<string, string> | null;
  tokenRequestContentType: OAuthProviderTokenRequestContentType;
  shouldUsePkce: boolean;
};

export type OAuthTokenRequestClient = Pick<
  ResolvedOAuthClient,
  | 'tokenEndpoint'
  | 'tokenRequestContentType'
  | 'clientId'
  | 'clientSecret'
  | 'tokenEndpointAuthMethod'
  | 'resource'
>;
