import {
  type OAuthProviderTokenEndpointAuthMethod,
  type OAuthProviderTokenRequestContentType,
} from 'twenty-shared/application';

import { type TokenExchangeResponse } from 'src/engine/core-modules/application/connection-provider/types/token-exchange-response.type';
import { postOAuthTokenRequest } from 'src/engine/core-modules/application/connection-provider/utils/post-oauth-token-request.util';

type FetchFn = typeof globalThis.fetch;

export const exchangeRefreshTokenForToken = (args: {
  fetchFn: FetchFn;
  tokenEndpoint: string;
  contentType: OAuthProviderTokenRequestContentType;
  tokenEndpointAuthMethod: OAuthProviderTokenEndpointAuthMethod;
  clientId: string;
  clientSecret: string;
  refreshToken: string;
}): Promise<TokenExchangeResponse> =>
  postOAuthTokenRequest({
    fetchFn: args.fetchFn,
    tokenEndpoint: args.tokenEndpoint,
    contentType: args.contentType,
    tokenEndpointAuthMethod: args.tokenEndpointAuthMethod,
    clientId: args.clientId,
    clientSecret: args.clientSecret,
    params: {
      grant_type: 'refresh_token',
      refresh_token: args.refreshToken,
    },
  });
