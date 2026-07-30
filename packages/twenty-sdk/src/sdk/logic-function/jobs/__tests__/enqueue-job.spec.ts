import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
  type MockInstance,
} from 'vitest';

import { enqueueJob } from '@/sdk/logic-function/jobs/enqueue-job';

const TARGET_UNIVERSAL_IDENTIFIER = '5a2f4d2a-1a1e-4c66-8a54-1f0a2b3c4d5e';

describe('enqueueJob', () => {
  let fetchSpy: MockInstance<typeof fetch>;

  beforeEach(() => {
    process.env.TWENTY_API_URL = 'https://api.test';
    process.env.TWENTY_APP_ACCESS_TOKEN = 'app-token';
    fetchSpy = vi.spyOn(globalThis, 'fetch');
  });

  afterEach(() => {
    delete process.env.TWENTY_API_URL;
    delete process.env.TWENTY_APP_ACCESS_TOKEN;
    fetchSpy.mockRestore();
  });

  it('posts the enqueueJob mutation and returns its result', async () => {
    fetchSpy.mockResolvedValue(
      new Response(
        JSON.stringify({
          data: {
            enqueueJob: {
              enqueued: true,
              logicFunctionUniversalIdentifier: TARGET_UNIVERSAL_IDENTIFIER,
            },
          },
        }),
        { status: 200 },
      ),
    );

    const result = await enqueueJob({
      logicFunctionUniversalIdentifier: TARGET_UNIVERSAL_IDENTIFIER,
      payload: { batchIndex: 2 },
      retryLimit: 3,
      delayMs: 1000,
    });

    expect(result).toEqual({
      enqueued: true,
      logicFunctionUniversalIdentifier: TARGET_UNIVERSAL_IDENTIFIER,
    });

    const [url, requestInit] = fetchSpy.mock.calls[0];

    expect(url).toBe('https://api.test/metadata');

    const sentBody = JSON.parse(requestInit?.body as string);

    expect(sentBody.query).toContain('enqueueJob(input: $input)');
    expect(sentBody.variables).toEqual({
      input: {
        logicFunctionUniversalIdentifier: TARGET_UNIVERSAL_IDENTIFIER,
        payload: { batchIndex: 2 },
        retryLimit: 3,
        delayMs: 1000,
      },
    });
  });

  it('omits the job options that were not provided', async () => {
    fetchSpy.mockResolvedValue(
      new Response(
        JSON.stringify({
          data: {
            enqueueJob: {
              enqueued: true,
              logicFunctionUniversalIdentifier: TARGET_UNIVERSAL_IDENTIFIER,
            },
          },
        }),
        { status: 200 },
      ),
    );

    await enqueueJob({
      logicFunctionUniversalIdentifier: TARGET_UNIVERSAL_IDENTIFIER,
    });

    const [, requestInit] = fetchSpy.mock.calls[0];
    const sentBody = JSON.parse(requestInit?.body as string);

    expect(sentBody.variables).toEqual({
      input: {
        logicFunctionUniversalIdentifier: TARGET_UNIVERSAL_IDENTIFIER,
      },
    });
  });

  it('surfaces GraphQL errors as a regular Error', async () => {
    fetchSpy.mockResolvedValue(
      new Response(
        JSON.stringify({
          errors: [{ message: 'Logic function not found' }],
        }),
        { status: 200 },
      ),
    );

    await expect(
      enqueueJob({
        logicFunctionUniversalIdentifier: TARGET_UNIVERSAL_IDENTIFIER,
      }),
    ).rejects.toThrow(/Logic function not found/);
  });
});
