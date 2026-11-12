import { isDefined } from 'twenty-shared/utils';

import { type ResolvedOAuthClient } from 'src/engine/core-modules/application/connection-provider/types/resolved-oauth-client.type';
import { type TokenExchangeResponse } from 'src/engine/core-modules/application/connection-provider/types/token-exchange-response.type';
import { postOAuthTokenRequest } from 'src/engine/core-modules/application/connection-provider/utils/post-oauth-token-request.util';

type FetchFn = typeof globalThis.fetch;

export const exchangeRefreshTokenForToken = ({
  fetchFn,
  client,
  refreshToken,
}: {
  fetchFn: FetchFn;
  client: ResolvedOAuthClient;
  refreshToken: string;
}): Promise<TokenExchangeResponse> =>
  postOAuthTokenRequest({
    fetchFn,
    tokenEndpoint: client.tokenEndpoint,
    contentType: client.tokenRequestContentType,
    params: {
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: client.clientId,
      ...(isDefined(client.clientSecret) && {
        client_secret: client.clientSecret,
      }),
      ...(isDefined(client.resource) && { resource: client.resource }),
    },
  });
