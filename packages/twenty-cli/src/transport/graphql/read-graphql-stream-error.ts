import { isNonEmptyArray } from '@sniptt/guards';
import { isDefined, isPlainObject } from 'twenty-shared/utils';

import { type ResolvedTarget } from '@/target/types/resolved-target.type';
import { createHttpStatusError } from '@/transport/create-http-status-error';
import { createGraphqlError } from '@/transport/graphql/create-graphql-error';
import { readEventStream } from '@/transport/graphql/read-event-stream';

export const readGraphqlStreamError = async ({
  response,
  target,
  signal,
}: {
  response: Response;
  target: ResolvedTarget;
  signal: AbortSignal;
}) => {
  if (isDefined(response.body)) {
    for await (const message of readEventStream({
      body: response.body,
      signal,
    })) {
      if (message.event !== 'next') {
        break;
      }
      let payload: unknown;
      try {
        payload = JSON.parse(message.data);
      } catch {
        break;
      }
      if (isPlainObject(payload) && isNonEmptyArray(payload.errors)) {
        return createGraphqlError({
          errors: payload.errors,
          data: payload.data,
          status: response.status,
          headers: response.headers,
          target,
        });
      }
      break;
    }
  }

  return createHttpStatusError({
    status: response.status,
    headers: response.headers,
    body: undefined,
    target,
  });
};
