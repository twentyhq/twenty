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
const JOB_IDS = [
  '0b9c8d7e-6f5a-4b3c-2d1e-0f9a8b7c6d5e',
  '1c8b7a6d-5e4f-3a2b-1c0d-9e8f7a6b5c4d',
];

const importEnqueueJobs = async () => {
  const module = await import('@/sdk/logic-function/jobs/enqueue-jobs');

  return module.enqueueJobs;
};

const graphqlResponse = (data: unknown) =>
  new Response(JSON.stringify({ data }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });

const successResponse = (enqueuedJobsCount: number) =>
  graphqlResponse({
    enqueueJobs: {
      enqueued: true,
      logicFunctionUniversalIdentifier: TARGET_UNIVERSAL_IDENTIFIER,
      enqueuedJobsCount,
      jobIds: JOB_IDS.slice(0, enqueuedJobsCount),
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
    fetchSpy.mockResolvedValue(successResponse(2));

    const enqueueJobs = await importEnqueueJobs();

    const result = await enqueueJobs({
      logicFunctionUniversalIdentifier: TARGET_UNIVERSAL_IDENTIFIER,
      payloads: [{ batchIndex: 0 }, { batchIndex: 1 }],
      retryLimit: 3,
      delayMs: 1000,
    });

    expect(result).toEqual({
      enqueued: true,
      logicFunctionUniversalIdentifier: TARGET_UNIVERSAL_IDENTIFIER,
      enqueuedJobsCount: 2,
      jobIds: JOB_IDS,
    });

    const [url, requestInit] = fetchSpy.mock.calls[0];

    expect(url).toBe('https://api.test/metadata');

    const sentBody = JSON.parse(requestInit?.body as string);

    expect(sentBody.query).toContain(
      'enqueueJobs(input:$v1){enqueued,logicFunctionUniversalIdentifier,enqueuedJobsCount,jobIds}',
    );
    expect(Object.values(sentBody.variables)).toEqual([
      {
        logicFunctionUniversalIdentifier: TARGET_UNIVERSAL_IDENTIFIER,
        payloads: [{ batchIndex: 0 }, { batchIndex: 1 }],
        retryLimit: 3,
        delayMs: 1000,
      },
    ]);
  });

  it('sends the app access token as a bearer credential', async () => {
    fetchSpy.mockResolvedValue(successResponse(1));

    const enqueueJobs = await importEnqueueJobs();

    await enqueueJobs({
      logicFunctionUniversalIdentifier: TARGET_UNIVERSAL_IDENTIFIER,
      payloads: [{}],
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

    const enqueueJobs = await importEnqueueJobs();

    await expect(
      enqueueJobs({
        logicFunctionUniversalIdentifier: TARGET_UNIVERSAL_IDENTIFIER,
        payloads: [{}],
      }),
    ).rejects.toThrow(/Logic function not found/);
  });
});
