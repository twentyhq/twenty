import { type CoreApiClient } from 'twenty-client-sdk/core';
import { vi } from 'vitest';

type CoreApiClientMockOptions = {
  queryResult?: unknown;
  onMutation?: (request: unknown) => void;
};

export const createCoreApiClientMock = ({
  queryResult,
  onMutation,
}: CoreApiClientMockOptions = {}): CoreApiClient => {
  const query = vi.fn(() => Promise.resolve(queryResult));
  const mutation = vi.fn((request: unknown) => {
    onMutation?.(request);

    return Promise.resolve({});
  });

  return { query, mutation } as unknown as CoreApiClient;
};
