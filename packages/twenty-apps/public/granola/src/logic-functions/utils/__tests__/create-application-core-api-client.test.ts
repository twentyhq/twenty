import { type CoreApiClient } from 'twenty-client-sdk/core';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { createApplicationCoreApiClient } from 'src/logic-functions/utils/create-application-core-api-client.util';

type CoreApiClientOptions = NonNullable<
  ConstructorParameters<typeof CoreApiClient>[0]
>;

const mocks = vi.hoisted(() => ({
  clientOptions: [] as CoreApiClientOptions[],
}));

vi.mock('twenty-client-sdk/core', () => ({
  CoreApiClient: class {
    constructor(options: CoreApiClientOptions) {
      mocks.clientOptions.push(options);
    }
  },
}));

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('createApplicationCoreApiClient', () => {
  it('runs as the application and waits out Twenty rate limits', async () => {
    vi.useFakeTimers();
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockImplementationOnce(async () =>
        Response.json({
          errors: [
            { extensions: { code: 'RATE_LIMITED', retryAfterMs: 1_000 } },
          ],
        }),
      )
      .mockImplementationOnce(async () => Response.json({ data: {} }));
    vi.stubGlobal('fetch', fetchMock);

    createApplicationCoreApiClient();
    const [options] = mocks.clientOptions;
    const response = options.fetch?.('https://example.test/graphql', {
      method: 'POST',
      body: JSON.stringify({ query: 'query { callRecordings { id } }' }),
    });
    await vi.advanceTimersByTimeAsync(3_000);

    expect(options.runAs).toBe('application');
    expect((await response)?.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
