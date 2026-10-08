import { describe, expect, it, vi } from 'vitest';

import { createFathomCoreApiClient } from 'src/logic-functions/utils/create-fathom-core-api-client.util';
import { fetchWithRateLimitRetry } from 'src/logic-functions/utils/fetch-with-rate-limit-retry.util';

const mocks = vi.hoisted(() => ({
  coreApiClientConstructor: vi.fn(),
}));

vi.mock('twenty-client-sdk/core', () => ({
  CoreApiClient: class CoreApiClient {
    constructor(options: unknown) {
      mocks.coreApiClientConstructor(options);
    }
  },
}));

describe('createFathomCoreApiClient', () => {
  it('runs as the application and retries Twenty rate limits', () => {
    createFathomCoreApiClient();

    expect(mocks.coreApiClientConstructor).toHaveBeenCalledExactlyOnceWith({
      runAs: 'application',
      fetch: fetchWithRateLimitRetry,
    });
  });
});
