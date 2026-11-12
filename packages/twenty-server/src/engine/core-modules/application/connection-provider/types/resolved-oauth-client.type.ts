import { type OAuthProviderTokenRequestContentType } from 'twenty-shared/application';

export type ResolvedOAuthClient = {
  authorizationEndpoint: string;
  tokenEndpoint: string;
  clientId: string;
  clientSecret: string | null;
  scopes: string[];
  resource: string | null;
  authorizationParams: Record<string, string> | null;
  tokenRequestContentType: OAuthProviderTokenRequestContentType;
  usePkce: boolean;
};
