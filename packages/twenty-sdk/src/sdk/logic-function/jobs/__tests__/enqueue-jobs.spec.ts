import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
  type MockInstance,
} from 'vitest';

const FIRST_UNIVERSAL_IDENTIFIER = '5a2f4d2a-1a1e-4c66-8a54-1f0a2b3c4d5e';
const SECOND_UNIVERSAL_IDENTIFIER = '7c1b9e3d-2b2f-4d77-9b65-2a1b3c4d5e6f';

const importEnqueueJobs = async () => {
  const module = await import('@/sdk/logic-function/jobs/enqueue-jobs');

  return module.enqueueJobs;
};

const graphqlResponse = (data: unknown) =>
  new Response(JSON.stringify({ data }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });

const successResponse = () =>
  graphqlResponse({
    enqueueJobs: {
      jobs: [
        {
          enqueued: true,
          logicFunctionUniversalIdentifier: FIRST_UNIVERSAL_IDENTIFIER,
        },
        {
          enqueued: true,
          logicFunctionUniversalIdentifier: SECOND_UNIVERSAL_IDENTIFIER,
        },
      ],
    },
  });

describe('enqueueJobs', () => {
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

  it('calls the enqueueJobs mutation on the metadata API and returns its result', async () => {
    fetchSpy.mockResolvedValue(successResponse());

    const enqueueJobs = await importEnqueueJobs();

    const result = await enqueueJobs([
      {
        logicFunctionUniversalIdentifier: FIRST_UNIVERSAL_IDENTIFIER,
        payload: { batchIndex: 0 },
        retryLimit: 3,
        delayMs: 1000,
      },
      {
        logicFunctionUniversalIdentifier: SECOND_UNIVERSAL_IDENTIFIER,
        payload: { batchIndex: 1 },
      },
    ]);

    expect(result).toEqual([
      {
        enqueued: true,
        logicFunctionUniversalIdentifier: FIRST_UNIVERSAL_IDENTIFIER,
      },
      {
        enqueued: true,
        logicFunctionUniversalIdentifier: SECOND_UNIVERSAL_IDENTIFIER,
      },
    ]);

    const [url, requestInit] = fetchSpy.mock.calls[0];

    expect(url).toBe('https://api.test/metadata');

    const sentBody = JSON.parse(requestInit?.body as string);

    expect(sentBody.query).toContain(
      'enqueueJobs(input:$v1){jobs{enqueued,logicFunctionUniversalIdentifier}}',
    );
    expect(Object.values(sentBody.variables)).toEqual([
      {
        jobs: [
          {
            logicFunctionUniversalIdentifier: FIRST_UNIVERSAL_IDENTIFIER,
            payload: { batchIndex: 0 },
            retryLimit: 3,
            delayMs: 1000,
          },
          {
            logicFunctionUniversalIdentifier: SECOND_UNIVERSAL_IDENTIFIER,
            payload: { batchIndex: 1 },
          },
        ],
      },
    ]);
  });

  it('sends the app access token as a bearer credential', async () => {
    fetchSpy.mockResolvedValue(successResponse());

    const enqueueJobs = await importEnqueueJobs();

    await enqueueJobs([
      { logicFunctionUniversalIdentifier: FIRST_UNIVERSAL_IDENTIFIER },
    ]);

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

    const enqueueJobs = await importEnqueueJobs();

    await expect(
      enqueueJobs([
        { logicFunctionUniversalIdentifier: FIRST_UNIVERSAL_IDENTIFIER },
      ]),
    ).rejects.toThrow(/Logic function not found/);
  });
});
