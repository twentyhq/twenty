import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
  type MockInstance,
} from 'vitest';

const JOB_IDS = [
  '0b9c8d7e-6f5a-4b3c-2d1e-0f9a8b7c6d5e',
  '1c8b7a6d-5e4f-3a2b-1c0d-9e8f7a6b5c4d',
];

const importGetJobs = async () => {
  const module = await import('@/sdk/logic-function/jobs/get-jobs');

  return module.getJobs;
};

const graphqlResponse = (data: unknown) =>
  new Response(JSON.stringify({ data }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });

const successResponse = () =>
  graphqlResponse({
    getJobs: [
      {
        jobId: JOB_IDS[0],
        state: 'COMPLETED',
        attemptsMade: 1,
        failedReason: null,
        enqueuedAt: 1788000000000,
        startedAt: 1788000001000,
        finishedAt: 1788000002000,
      },
    ],
  });

describe('getJobs', () => {
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

  it('calls the getJobs query on the metadata API and returns its result', async () => {
    fetchSpy.mockResolvedValue(successResponse());

    const getJobs = await importGetJobs();

    const result = await getJobs(JOB_IDS);

    expect(result).toEqual([
      {
        jobId: JOB_IDS[0],
        state: 'COMPLETED',
        attemptsMade: 1,
        failedReason: null,
        enqueuedAt: 1788000000000,
        startedAt: 1788000001000,
        finishedAt: 1788000002000,
      },
    ]);

    const [url, requestInit] = fetchSpy.mock.calls[0];

    expect(url).toBe('https://api.test/metadata');

    const sentBody = JSON.parse(requestInit?.body as string);

    expect(sentBody.query).toContain(
      'getJobs(jobIds:$v1){jobId,state,attemptsMade,failedReason,enqueuedAt,startedAt,finishedAt}',
    );
    expect(Object.values(sentBody.variables)).toEqual([JOB_IDS]);
  });

  it('sends the app access token as a bearer credential', async () => {
    fetchSpy.mockResolvedValue(successResponse());

    const getJobs = await importGetJobs();

    await getJobs(JOB_IDS);

    const [, requestInit] = fetchSpy.mock.calls[0];
    const headers = new Headers(requestInit?.headers);

    expect(headers.get('authorization')).toBe('Bearer app-token');
  });

  it('surfaces GraphQL errors as a rejection', async () => {
    fetchSpy.mockResolvedValue(
      new Response(JSON.stringify({ errors: [{ message: 'Job not found' }] }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    const getJobs = await importGetJobs();

    await expect(getJobs(JOB_IDS)).rejects.toThrow(/Job not found/);
  });
});
