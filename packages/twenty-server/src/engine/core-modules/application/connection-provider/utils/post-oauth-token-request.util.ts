import { type OAuthProviderTokenRequestContentType } from 'twenty-shared/application';

import { type TokenExchangeResponse } from 'src/engine/core-modules/application/connection-provider/types/token-exchange-response.type';
import { encodeOAuthBody } from 'src/engine/core-modules/application/connection-provider/utils/encode-oauth-body.util';
import { parseTokenResponse } from 'src/engine/core-modules/application/connection-provider/utils/parse-token-response.util';

type FetchFn = typeof globalThis.fetch;

// Carries the HTTP status alongside the message so callers can distinguish
// transient (5xx, network) from permanent (4xx) failures.
export class OAuthTokenEndpointError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = 'OAuthTokenEndpointError';
  }
}

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

    throw new OAuthTokenEndpointError(
      `Token endpoint responded with ${response.status}: ${text.slice(0, 500)}`,
      response.status,
    );
  }

  return parseTokenResponse((await response.json()) as Record<string, unknown>);
};
