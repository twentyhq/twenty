import { CoreApiClient } from 'twenty-client-sdk/core';
import { MetadataApiClient } from 'twenty-client-sdk/metadata';

import { withRateLimitRetry } from './retry';

type Queryable = {
  query: (...args: unknown[]) => Promise<unknown>;
  mutation: (...args: unknown[]) => Promise<unknown>;
};

function wrapWithRetry<T extends Queryable>(client: T): T {
  const originalQuery = client.query.bind(client);
  const originalMutation = client.mutation.bind(client);

  client.query = ((...args: unknown[]) =>
    withRateLimitRetry(() => originalQuery(...args))) as T['query'];
  client.mutation = ((...args: unknown[]) =>
    withRateLimitRetry(() => originalMutation(...args))) as T['mutation'];

  return client;
}

export const metadata = () =>
  wrapWithRetry(
    new MetadataApiClient({
      headers: {
        Authorization: `Bearer ${process.env.TWENTY_API_KEY}`,
      },
    }) as unknown as Queryable,
  ) as unknown as MetadataApiClient;

export const core = () =>
  wrapWithRetry(new CoreApiClient() as unknown as Queryable) as unknown as CoreApiClient;
