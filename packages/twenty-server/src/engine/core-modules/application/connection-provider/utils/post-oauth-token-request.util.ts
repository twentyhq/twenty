import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { type OAuthTokenRequestClient } from 'src/engine/core-modules/application/connection-provider/types/resolved-oauth-client.type';
import { type TokenExchangeResponse } from 'src/engine/core-modules/application/connection-provider/types/token-exchange-response.type';
import { buildOAuthClientAuthentication } from 'src/engine/core-modules/application/connection-provider/utils/build-oauth-client-authentication.util';
import { encodeOAuthBody } from 'src/engine/core-modules/application/connection-provider/utils/encode-oauth-body.util';
import { parseTokenResponse } from 'src/engine/core-modules/application/connection-provider/utils/parse-token-response.util';

type FetchFn = typeof globalThis.fetch;

// Carries the HTTP status alongside the message so callers can distinguish
// transient (5xx, network) from permanent (4xx) failures.
export class OAuthTokenEndpointError extends Error {
  readonly status: number;
  readonly errorCode: string | null;

  constructor({
    message,
    status,
    errorCode,
  }: {
    message: string;
    status: number;
    errorCode: string | null;
  }) {
    super(message);
    this.name = 'OAuthTokenEndpointError';
    this.status = status;
    this.errorCode = errorCode;
  }
}

const readOAuthErrorCode = (text: string): string | null => {
  try {
    const { error } = JSON.parse(text);

    return isNonEmptyString(error) ? error : null;
  } catch {
    return null;
  }
};

export const postOAuthTokenRequest = async (args: {
  fetchFn: FetchFn;
  client: OAuthTokenRequestClient;
  grantParams: Record<string, string>;
}): Promise<TokenExchangeResponse> => {
  const { client } = args;
  const clientAuthentication = buildOAuthClientAuthentication(client);
  const { body, contentTypeHeader } = encodeOAuthBody(
    client.tokenRequestContentType,
    {
      ...args.grantParams,
      ...clientAuthentication.params,
      ...(isDefined(client.resource) && { resource: client.resource }),
    },
  );

  const response = await args.fetchFn(client.tokenEndpoint, {
    method: 'POST',
    headers: {
      ...clientAuthentication.headers,
      'Content-Type': contentTypeHeader,
      // Many providers (notably GitHub) default to URL-encoded responses
      // unless we explicitly ask for JSON.
      Accept: 'application/json',
    },
    body,
  });

  if (!response.ok) {
    const text = await response.text();

    throw new OAuthTokenEndpointError({
      message: `Token endpoint responded with ${response.status}: ${text.slice(0, 500)}`,
      status: response.status,
      errorCode: readOAuthErrorCode(text),
    });
  }

  return parseTokenResponse((await response.json()) as Record<string, unknown>);
};
