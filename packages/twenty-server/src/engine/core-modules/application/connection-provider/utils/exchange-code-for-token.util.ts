import { type OAuthProviderTokenRequestContentType } from 'twenty-shared/application';

import { type TokenExchangeResponse } from 'src/engine/core-modules/application/connection-provider/types/token-exchange-response.type';
import { postOAuthTokenRequest } from 'src/engine/core-modules/application/connection-provider/utils/post-oauth-token-request.util';

type FetchFn = typeof globalThis.fetch;

export const exchangeCodeForToken = (args: {
  fetchFn: FetchFn;
  tokenEndpoint: string;
  contentType: OAuthProviderTokenRequestContentType;
  clientId: string;
  clientSecret: string;
  code: string;
  redirectUri: string;
  codeVerifier: string | null;
}): Promise<TokenExchangeResponse> => {
  const params: Record<string, string> = {
    grant_type: 'authorization_code',
    code: args.code,
    redirect_uri: args.redirectUri,
    client_id: args.clientId,
    client_secret: args.clientSecret,
  };

  if (args.codeVerifier) {
    params.code_verifier = args.codeVerifier;
  }

  return postOAuthTokenRequest({
    fetchFn: args.fetchFn,
    tokenEndpoint: args.tokenEndpoint,
    contentType: args.contentType,
    params,
  });
};
