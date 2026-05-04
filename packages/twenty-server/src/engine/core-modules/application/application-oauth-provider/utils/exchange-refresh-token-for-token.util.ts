import { type OAuthProviderTokenRequestContentType } from 'twenty-shared/application';

import { type TokenExchangeResponse } from 'src/engine/core-modules/application/application-oauth-provider/types/token-exchange-response.type';
import { postOAuthTokenRequest } from 'src/engine/core-modules/application/application-oauth-provider/utils/post-oauth-token-request.util';

type FetchFn = typeof globalThis.fetch;

export const exchangeRefreshTokenForToken = (args: {
  fetchFn: FetchFn;
  tokenEndpoint: string;
  contentType: OAuthProviderTokenRequestContentType;
  clientId: string;
  clientSecret: string;
  refreshToken: string;
}): Promise<TokenExchangeResponse> =>
  postOAuthTokenRequest({
    fetchFn: args.fetchFn,
    tokenEndpoint: args.tokenEndpoint,
    contentType: args.contentType,
    params: {
      grant_type: 'refresh_token',
      refresh_token: args.refreshToken,
      client_id: args.clientId,
      client_secret: args.clientSecret,
    },
  });
