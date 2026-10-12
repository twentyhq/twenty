import { isNonEmptyString } from '@sniptt/guards';
import { isPlainObject } from 'twenty-shared/utils';

import { type OAuthTokens } from '@/oauth/types/oauth-tokens.type';
import { CliError } from '@/output/cli-error';
import { createBoundedFetch } from '@/transport/create-target-fetch';
import { parseResponseBody } from '@/transport/parse-response-body';

export const requestOAuthTokens = async ({
  apiUrl,
  tokenEndpoint,
  parameters,
  signal,
}: {
  apiUrl: string;
  tokenEndpoint: string;
  parameters: Record<string, string>;
  signal: AbortSignal;
}): Promise<OAuthTokens> => {
  const response = await createBoundedFetch({ apiUrl, signal })(tokenEndpoint, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(parameters),
  });
  const body = await parseResponseBody(response);
  const tokens = isPlainObject(body) ? body : {};

  if (!response.ok || !isNonEmptyString(tokens.access_token)) {
    throw new CliError({
      code: 'OAUTH_FAILED',
      message: isNonEmptyString(tokens.error_description)
        ? tokens.error_description
        : `The token endpoint answered ${response.status}.`,
      details: {
        status: response.status,
        error: isNonEmptyString(tokens.error) ? tokens.error : null,
      },
    });
  }

  return {
    accessToken: tokens.access_token,
    ...(isNonEmptyString(tokens.refresh_token)
      ? { refreshToken: tokens.refresh_token }
      : {}),
  };
};
