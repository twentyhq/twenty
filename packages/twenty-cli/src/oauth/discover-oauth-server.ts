import { isArray, isNonEmptyString } from '@sniptt/guards';
import { isDefined, isPlainObject } from 'twenty-shared/utils';

import { type OAuthServer } from '@/oauth/types/oauth-server.type';
import { CliError } from '@/output/cli-error';
import { API_URL_PROTOCOLS } from '@/target/constants/api-url-protocols.constant';
import { formatApiUrl } from '@/target/format-api-url';
import { assertUrlWithinTarget } from '@/transport/assert-url-within-target';
import { createBoundedFetch } from '@/transport/create-target-fetch';
import { parseResponseBody } from '@/transport/parse-response-body';
import { resolveRequestUrl } from '@/transport/resolve-request-url';

const DISCOVERY_PATH = '/.well-known/oauth-authorization-server';

const createUnavailableError = (apiUrl: string, reason: string) =>
  new CliError({
    code: 'OAUTH_UNAVAILABLE',
    message: `Browser sign-in is not available on ${apiUrl}: ${reason}`,
    hint: 'Retry this command with --with-token and pipe an API key on standard input.',
  });

const parseHttpUrl = (value: unknown) => {
  const url = isNonEmptyString(value) ? URL.parse(value) : null;

  return isDefined(url) && API_URL_PROTOCOLS.includes(url.protocol)
    ? url
    : undefined;
};

export const discoverOAuthServer = async ({
  apiUrl,
  signal,
}: {
  apiUrl: string;
  signal: AbortSignal;
}): Promise<OAuthServer> => {
  const response = await createBoundedFetch({ apiUrl, signal })(
    resolveRequestUrl({ apiUrl, path: DISCOVERY_PATH }),
    { headers: { Accept: 'application/json' } },
  );
  const metadata = await parseResponseBody(response);

  if (!response.ok || !isPlainObject(metadata)) {
    throw createUnavailableError(
      apiUrl,
      `the server answered ${response.status}.`,
    );
  }

  const authorizationEndpoint = parseHttpUrl(metadata.authorization_endpoint);
  const tokenEndpoint = parseHttpUrl(metadata.token_endpoint);
  const challengeMethods = metadata.code_challenge_methods_supported;

  if (
    !isNonEmptyString(metadata.issuer) ||
    !isNonEmptyString(metadata.cli_client_id) ||
    !isDefined(authorizationEndpoint) ||
    !isDefined(tokenEndpoint) ||
    (isArray(challengeMethods) && !challengeMethods.includes('S256'))
  ) {
    throw createUnavailableError(apiUrl, 'its OAuth metadata is incomplete.');
  }

  const issuer = URL.parse(metadata.issuer);

  if (!isDefined(issuer) || formatApiUrl(issuer) !== apiUrl) {
    throw createUnavailableError(
      apiUrl,
      `it identifies itself as ${metadata.issuer}.`,
    );
  }

  try {
    assertUrlWithinTarget({
      url: tokenEndpoint,
      apiUrl,
      requestedPath: tokenEndpoint.href,
    });
  } catch {
    throw createUnavailableError(
      apiUrl,
      `its token endpoint ${tokenEndpoint.origin} is on another server.`,
    );
  }

  return {
    issuer: metadata.issuer,
    isIssuerInResponse:
      metadata.authorization_response_iss_parameter_supported === true,
    authorizationEndpoint: authorizationEndpoint.href,
    tokenEndpoint: tokenEndpoint.href,
    clientId: metadata.cli_client_id,
  };
};
