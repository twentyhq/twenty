import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
  type MockInstance,
} from 'vitest';

const TARGET_UNIVERSAL_IDENTIFIER = '5a2f4d2a-1a1e-4c66-8a54-1f0a2b3c4d5e';

const importEnqueueJob = async () => {
  const module = await import('@/sdk/logic-function/jobs/enqueue-job');

  return module.enqueueJob;
};

const graphqlResponse = (data: unknown) =>
  new Response(JSON.stringify({ data }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });

const successResponse = () =>
  graphqlResponse({
    enqueueJob: {
      enqueued: true,
      logicFunctionUniversalIdentifier: TARGET_UNIVERSAL_IDENTIFIER,
    },
  });

describe('enqueueJob', () => {
  let fetchSpy: MockInstance<typeof fetch>;

  beforeEach(() => {
    vi.resetModules();
    process.env.TWENTY_API_URL = 'https://api.test';
    process.env.TWENTY_APP_ACCESS_TOKEN = 'app-token';
    fetchSpy = vi.spyOn(globalThis, 'fetch');
  });

  afterEach(() => {
    delete process.env.TWENTY_API_URL;
    delete process.env.TWENTY_APP_ACCESS_TOKEN;
    fetchSpy.mockRestore();
  });

  it('calls the enqueueJob mutation on the metadata API and returns its result', async () => {
    fetchSpy.mockResolvedValue(successResponse());

    const enqueueJob = await importEnqueueJob();

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

    expect(sentBody.query).toContain(
      'enqueueJob(input:$v1){enqueued,logicFunctionUniversalIdentifier}',
    );
    expect(Object.values(sentBody.variables)).toEqual([
      {
        logicFunctionUniversalIdentifier: TARGET_UNIVERSAL_IDENTIFIER,
        payload: { batchIndex: 2 },
        retryLimit: 3,
        delayMs: 1000,
      },
    ]);
  });

  it('sends the app access token as a bearer credential', async () => {
    fetchSpy.mockResolvedValue(successResponse());

    const enqueueJob = await importEnqueueJob();

    await enqueueJob({
      logicFunctionUniversalIdentifier: TARGET_UNIVERSAL_IDENTIFIER,
    });

    const [, requestInit] = fetchSpy.mock.calls[0];
    const headers = new Headers(requestInit?.headers);

    expect(headers.get('authorization')).toBe('Bearer app-token');
  });

  it('surfaces GraphQL errors as a rejection', async () => {
    fetchSpy.mockResolvedValue(
      new Response(
        JSON.stringify({ errors: [{ message: 'Logic function not found' }] }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      ),
    );

    const enqueueJob = await importEnqueueJob();

    await expect(
      enqueueJob({
        logicFunctionUniversalIdentifier: TARGET_UNIVERSAL_IDENTIFIER,
      }),
    ).rejects.toThrow(/Logic function not found/);
  });
});
