import { isString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { CliError } from '@/output/cli-error';
import { type ResolvedTarget } from '@/target/types/resolved-target.type';
import { assertUrlWithinTarget } from '@/transport/assert-url-within-target';
import { REQUEST_TIMEOUT_MILLISECONDS } from '@/transport/constants/request-timeout-milliseconds.constant';
import { RESPONSE_BYTE_LIMIT } from '@/transport/constants/response-byte-limit.constant';
import { fetchWithProxy } from '@/transport/fetch-with-proxy';
import { readBoundedBody } from '@/transport/read-bounded-body';

const NULL_BODY_STATUSES = new Set([101, 204, 205, 304]);

const isRedirectStatus = (status: number) => status >= 300 && status < 400;

const getRedirectOrigin = (response: Response, requestUrl: URL) => {
  const location = response.headers.get('location');

  return isDefined(location)
    ? URL.parse(location, requestUrl.href)?.origin
    : undefined;
};

export const toTransportError = ({
  error,
  signal,
  url,
  timeoutMilliseconds,
}: {
  error: unknown;
  signal: AbortSignal;
  url: URL;
  timeoutMilliseconds: number;
}) => {
  if (error instanceof CliError || signal.aborted) {
    return error;
  }

  if (error instanceof Error && error.name === 'TimeoutError') {
    return new CliError({
      code: 'TIMEOUT',
      message: `${url.origin} did not answer within ${timeoutMilliseconds / 1000} seconds.`,
    });
  }

  const reason =
    error instanceof Error && error.cause instanceof Error
      ? error.cause.message
      : String(error);
  const cause =
    error instanceof Error && error.cause instanceof Error
      ? error.cause
      : error;
  const networkCode =
    cause instanceof Error && 'code' in cause && isString(cause.code)
      ? cause.code
      : undefined;

  return new CliError({
    code: 'NETWORK_ERROR',
    message: `Could not reach ${url.origin}.`,
    hint: 'Check the API URL and that the server is running.',
    details: { reason, ...(isDefined(networkCode) ? { networkCode } : {}) },
  });
};

export const createRedirectError = (response: Response, url: URL) => {
  const redirectOrigin = getRedirectOrigin(response, url);

  return new CliError({
    code: 'REDIRECT_NOT_FOLLOWED',
    message: `${url.origin} answered with a redirect (${response.status}), and redirects are not followed.`,
    hint: isDefined(redirectOrigin)
      ? `It redirects to ${redirectOrigin}. If that is the right server, use it as the API URL.`
      : 'Check that the API URL points at the Twenty server itself.',
    details: {
      status: response.status,
      redirectOrigin: redirectOrigin ?? null,
    },
  });
};

export const createBoundedFetch =
  ({
    apiUrl,
    bearerToken,
    signal,
    timeoutMilliseconds = REQUEST_TIMEOUT_MILLISECONDS,
  }: {
    apiUrl: string;
    bearerToken?: string;
    signal: AbortSignal;
    timeoutMilliseconds?: number;
  }): typeof fetch =>
  async (input, init = {}) => {
    const url = new URL(input instanceof Request ? input.url : input);

    assertUrlWithinTarget({ url, apiUrl, requestedPath: url.pathname });

    const headers = new Headers(init.headers);

    if (isDefined(bearerToken)) {
      headers.set('Authorization', `Bearer ${bearerToken}`);
    }

    try {
      const response = await fetchWithProxy(
        url,
        {
          ...init,
          headers,
          redirect: 'manual',
          signal: AbortSignal.any([
            signal,
            AbortSignal.timeout(timeoutMilliseconds),
          ]),
        },
        timeoutMilliseconds === REQUEST_TIMEOUT_MILLISECONDS
          ? undefined
          : timeoutMilliseconds,
      );

      if (isRedirectStatus(response.status)) {
        await response.body?.cancel();

        throw createRedirectError(response, url);
      }

      const body = await readBoundedBody(response, RESPONSE_BYTE_LIMIT);

      return new Response(
        NULL_BODY_STATUSES.has(response.status) ? null : body,
        {
          status: response.status,
          statusText: response.statusText,
          headers: response.headers,
        },
      );
    } catch (error) {
      throw toTransportError({ error, signal, url, timeoutMilliseconds });
    }
  };

export const createTargetFetch = ({
  target,
  signal,
  timeoutMilliseconds,
}: {
  target: ResolvedTarget;
  signal: AbortSignal;
  timeoutMilliseconds?: number;
}) =>
  createBoundedFetch({
    apiUrl: target.apiUrl,
    bearerToken: target.bearerToken,
    signal,
    timeoutMilliseconds,
  });
