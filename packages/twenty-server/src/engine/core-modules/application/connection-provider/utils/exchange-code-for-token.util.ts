import { isDefined } from 'twenty-shared/utils';

import { type OAuthTokenRequestClient } from 'src/engine/core-modules/application/connection-provider/types/resolved-oauth-client.type';
import { type TokenExchangeResponse } from 'src/engine/core-modules/application/connection-provider/types/token-exchange-response.type';
import { postOAuthTokenRequest } from 'src/engine/core-modules/application/connection-provider/utils/post-oauth-token-request.util';

type FetchFn = typeof globalThis.fetch;

export const exchangeCodeForToken = ({
  fetchFn,
  client,
  code,
  redirectUri,
  codeVerifier,
}: {
  fetchFn: FetchFn;
  client: OAuthTokenRequestClient;
  code: string;
  redirectUri: string;
  codeVerifier: string | null;
}): Promise<TokenExchangeResponse> =>
  postOAuthTokenRequest({
    fetchFn,
    client,
    grantParams: {
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
      ...(isDefined(codeVerifier) && { code_verifier: codeVerifier }),
    },
  });
