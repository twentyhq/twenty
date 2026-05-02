import { type OAuthProviderTokenRequestContentType } from 'twenty-shared/application';

import { type TokenExchangeResponse } from 'src/engine/core-modules/application/application-oauth-provider/types/token-exchange-response.type';
import { encodeOAuthBody } from 'src/engine/core-modules/application/application-oauth-provider/utils/encode-oauth-body.util';
import { parseTokenResponse } from 'src/engine/core-modules/application/application-oauth-provider/utils/parse-token-response.util';

type FetchFn = typeof globalThis.fetch;

export const postOAuthTokenRequest = async (args: {
  fetchFn: FetchFn;
  tokenEndpoint: string;
  contentType: OAuthProviderTokenRequestContentType;
  params: Record<string, string>;
}): Promise<TokenExchangeResponse> => {
  const { body, contentTypeHeader } = encodeOAuthBody(
    args.contentType,
    args.params,
  );

  const response = await args.fetchFn(args.tokenEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': contentTypeHeader,
      // Many providers (notably GitHub) default to URL-encoded responses
      // unless we explicitly ask for JSON.
      Accept: 'application/json',
    },
    body,
  });

  if (!response.ok) {
    const text = await response.text();

    throw new Error(
      `Token endpoint responded with ${response.status}: ${text.slice(0, 500)}`,
    );
  }

  return parseTokenResponse((await response.json()) as Record<string, unknown>);
};
