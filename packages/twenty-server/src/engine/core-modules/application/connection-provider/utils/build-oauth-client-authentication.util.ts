import { isDefined } from 'twenty-shared/utils';

import { type OAuthTokenRequestClient } from 'src/engine/core-modules/application/connection-provider/types/resolved-oauth-client.type';

type OAuthClientAuthentication = {
  params: Record<string, string>;
  headers: Record<string, string>;
};

// RFC 6749 section 2.3.1: credentials are form-encoded before being base64-encoded
const encodeBasicCredential = (value: string): string =>
  new URLSearchParams({ value }).toString().slice('value='.length);

export const buildOAuthClientAuthentication = ({
  clientId,
  clientSecret,
  tokenEndpointAuthMethod,
}: Pick<
  OAuthTokenRequestClient,
  'clientId' | 'clientSecret' | 'tokenEndpointAuthMethod'
>): OAuthClientAuthentication => {
  if (!isDefined(clientSecret) || tokenEndpointAuthMethod === 'none') {
    return { params: { client_id: clientId }, headers: {} };
  }

  if (tokenEndpointAuthMethod === 'client_secret_basic') {
    const credentials = `${encodeBasicCredential(clientId)}:${encodeBasicCredential(clientSecret)}`;

    return {
      params: {},
      headers: {
        Authorization: `Basic ${Buffer.from(credentials).toString('base64')}`,
      },
    };
  }

  return {
    params: { client_id: clientId, client_secret: clientSecret },
    headers: {},
  };
};
