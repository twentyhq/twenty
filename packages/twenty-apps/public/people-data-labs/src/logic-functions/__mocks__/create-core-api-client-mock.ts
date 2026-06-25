import { type CoreApiClient } from 'twenty-client-sdk/core';
import { vi } from 'vitest';

type Resolver<TResult> = TResult | ((request: unknown) => TResult);

type CoreApiClientMockOptions = {
  queryResult?: Resolver<unknown>;
  mutationResult?: Resolver<unknown>;
  onMutation?: (request: unknown) => void;
};

const resolve = <TResult>(
  resolver: Resolver<TResult> | undefined,
  request: unknown,
): TResult | undefined =>
  typeof resolver === 'function'
    ? (resolver as (request: unknown) => TResult)(request)
    : resolver;

export const createCoreApiClientMock = ({
  queryResult,
  mutationResult,
  onMutation,
}: CoreApiClientMockOptions = {}): CoreApiClient => {
  const query = vi.fn((request: unknown) =>
    Promise.resolve(resolve(queryResult, request)),
  );
  const mutation = vi.fn((request: unknown) => {
    onMutation?.(request);

    return Promise.resolve(resolve(mutationResult, request) ?? {});
  });

  return { query, mutation } as unknown as CoreApiClient;
};
