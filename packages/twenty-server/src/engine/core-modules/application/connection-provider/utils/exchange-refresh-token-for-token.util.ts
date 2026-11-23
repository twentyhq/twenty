import { type OAuthTokenRequestClient } from 'src/engine/core-modules/application/connection-provider/types/resolved-oauth-client.type';
import { type TokenExchangeResponse } from 'src/engine/core-modules/application/connection-provider/types/token-exchange-response.type';
import { postOAuthTokenRequest } from 'src/engine/core-modules/application/connection-provider/utils/post-oauth-token-request.util';

type FetchFn = typeof globalThis.fetch;

export const exchangeRefreshTokenForToken = ({
  fetchFn,
  client,
  refreshToken,
}: {
  fetchFn: FetchFn;
  client: OAuthTokenRequestClient;
  refreshToken: string;
}): Promise<TokenExchangeResponse> =>
  postOAuthTokenRequest({
    fetchFn,
    client,
    grantParams: {
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    },
  });
