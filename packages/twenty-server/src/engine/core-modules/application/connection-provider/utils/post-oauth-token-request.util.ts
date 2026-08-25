import {
  type OAuthProviderTokenEndpointAuthMethod,
  type OAuthProviderTokenRequestContentType,
} from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { type TokenExchangeResponse } from 'src/engine/core-modules/application/connection-provider/types/token-exchange-response.type';
import { encodeOAuthBody } from 'src/engine/core-modules/application/connection-provider/utils/encode-oauth-body.util';
import { parseTokenResponse } from 'src/engine/core-modules/application/connection-provider/utils/parse-token-response.util';

type FetchFn = typeof globalThis.fetch;

const FORM_URL_ENCODED_VALUE_PREFIX = 'value=';

const encodeOAuthBasicCredential = (credential: string): string =>
  new URLSearchParams({ value: credential })
    .toString()
    .slice(FORM_URL_ENCODED_VALUE_PREFIX.length);

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
  tokenEndpointAuthMethod: OAuthProviderTokenEndpointAuthMethod;
  clientId: string;
  clientSecret: string;
  params: Record<string, string>;
}): Promise<TokenExchangeResponse> => {
  const params =
    args.tokenEndpointAuthMethod === 'client_secret_post'
      ? {
          ...args.params,
          client_id: args.clientId,
          client_secret: args.clientSecret,
        }
      : args.params;
  const { body, contentTypeHeader } = encodeOAuthBody(args.contentType, params);

  const authorizationHeader =
    args.tokenEndpointAuthMethod === 'client_secret_basic'
      ? `Basic ${Buffer.from(
          `${encodeOAuthBasicCredential(args.clientId)}:${encodeOAuthBasicCredential(args.clientSecret)}`,
        ).toString('base64')}`
      : undefined;

  const response = await args.fetchFn(args.tokenEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': contentTypeHeader,
      // Many providers (notably GitHub) default to URL-encoded responses
      // unless we explicitly ask for JSON.
      Accept: 'application/json',
      ...(isDefined(authorizationHeader)
        ? { Authorization: authorizationHeader }
        : {}),
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
