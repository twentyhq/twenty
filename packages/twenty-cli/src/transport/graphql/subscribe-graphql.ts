import { isArray } from '@sniptt/guards';
import { isDefined, isPlainObject } from 'twenty-shared/utils';

import { CliError } from '@/output/cli-error';
import { type ResolvedTarget } from '@/target/types/resolved-target.type';
import { REQUEST_TIMEOUT_MILLISECONDS } from '@/transport/constants/request-timeout-milliseconds.constant';
import { RESPONSE_BYTE_LIMIT } from '@/transport/constants/response-byte-limit.constant';
import {
  createRedirectError,
  toTransportError,
} from '@/transport/create-target-fetch';
import { fetchWithProxy } from '@/transport/fetch-with-proxy';
import { GRAPHQL_ENDPOINT_PATHS } from '@/transport/graphql/constants/graphql-endpoint-paths.constant';
import { createGraphqlError } from '@/transport/graphql/create-graphql-error';
import { parseGraphqlResponse } from '@/transport/graphql/parse-graphql-response';
import { readEventStream } from '@/transport/graphql/read-event-stream';
import { readBoundedBody } from '@/transport/read-bounded-body';
import { resolveRequestUrl } from '@/transport/resolve-request-url';

const invalidStream = (message: string) =>
  new CliError({ code: 'INVALID_RESPONSE', message });

export const subscribeGraphql = async ({
  target,
  signal,
  query,
  variables,
  onConnected,
  onData,
}: {
  target: ResolvedTarget;
  signal: AbortSignal;
  query: string;
  variables: Record<string, unknown>;
  onConnected: () => Promise<void>;
  onData: (data: unknown) => Promise<void>;
}) => {
  const url = resolveRequestUrl({
    apiUrl: target.apiUrl,
    path: GRAPHQL_ENDPOINT_PATHS.metadata,
  });
  const controller = new AbortController();
  const requestSignal = AbortSignal.any([signal, controller.signal]);
  const timer = setTimeout(
    () =>
      controller.abort(
        new DOMException('Connection timed out', 'TimeoutError'),
      ),
    REQUEST_TIMEOUT_MILLISECONDS,
  );

  try {
    const response = await fetchWithProxy(
      url,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${target.bearerToken}`,
          'Content-Type': 'application/json',
          Accept: 'text/event-stream',
        },
        body: JSON.stringify({ query, variables }),
        redirect: 'manual',
        signal: requestSignal,
      },
      REQUEST_TIMEOUT_MILLISECONDS,
    );

    if (response.status >= 300 && response.status < 400) {
      await response.body?.cancel();
      throw createRedirectError(response, url);
    }
    if (
      !response.ok ||
      response.headers
        .get('content-type')
        ?.split(';')[0]
        .trim()
        .toLowerCase() !== 'text/event-stream'
    ) {
      const bytes = await readBoundedBody(response, RESPONSE_BYTE_LIMIT);
      await parseGraphqlResponse({
        response: new Response(
          [204, 205].includes(response.status) ? null : bytes,
          {
            status: response.status,
            headers: response.headers,
          },
        ),
        target,
      });
      throw invalidStream('The server did not return a GraphQL event stream.');
    }
    if (!isDefined(response.body)) {
      throw invalidStream('The server returned an empty log stream.');
    }
    clearTimeout(timer);
    await onConnected();

    for await (const message of readEventStream({
      body: response.body,
      signal: requestSignal,
    })) {
      if (message.event === 'complete') {
        return;
      }
      if (message.event !== 'next') {
        throw invalidStream(
          'The server returned an unsupported GraphQL stream event.',
        );
      }
      let payload: unknown;
      try {
        payload = JSON.parse(message.data);
      } catch {
        throw invalidStream('The log stream contains invalid JSON.');
      }
      if (!isPlainObject(payload)) {
        throw invalidStream(
          'The log stream contains an invalid GraphQL result.',
        );
      }
      if (isArray(payload.errors) && payload.errors.length > 0) {
        throw createGraphqlError({
          errors: payload.errors,
          data: payload.data,
          status: response.status,
          headers: response.headers,
          target,
        });
      }
      if (!('data' in payload)) {
        throw invalidStream('The log stream contains no GraphQL data.');
      }
      await onData(payload.data);
    }

    throw new CliError({
      code: 'NETWORK_ERROR',
      message: 'The log stream ended without a completion event.',
      hint: 'Restart twenty app logs to resume watching. Logs produced while disconnected cannot be replayed.',
    });
  } catch (error) {
    throw toTransportError({
      error,
      signal,
      url,
      timeoutMilliseconds: REQUEST_TIMEOUT_MILLISECONDS,
    });
  } finally {
    clearTimeout(timer);
    controller.abort();
  }
};
