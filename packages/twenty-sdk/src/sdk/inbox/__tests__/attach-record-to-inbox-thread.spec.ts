import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
  type MockInstance,
} from 'vitest';

const LINK_INPUT = {
  threadId: '6f1d7c2a-3b4e-4f5a-8b9c-0d1e2f3a4b5c',
  objectNameSingular: 'company',
  recordId: '20202020-0000-4000-8000-000000000002',
};

const importAttachRecordToInboxThread = async () => {
  const module = await import('@/sdk/inbox/attach-record-to-inbox-thread');

  return module.attachRecordToInboxThread;
};

const graphqlResponse = (body: unknown) =>
  new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });

describe('attachRecordToInboxThread', () => {
  let fetchSpy: MockInstance<typeof fetch>;

  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv('TWENTY_API_URL', 'https://api.test');
    vi.stubEnv('TWENTY_APP_ACCESS_TOKEN', undefined);
    vi.stubEnv('TWENTY_APP_APPLICATION_ACCESS_TOKEN', 'app-token');
    fetchSpy = vi.spyOn(globalThis, 'fetch');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    fetchSpy.mockRestore();
  });

  it('calls the attachRecordToInboxThread mutation on the metadata API', async () => {
    fetchSpy.mockResolvedValue(
      graphqlResponse({ data: { attachRecordToInboxThread: true } }),
    );

    const attachRecordToInboxThread = await importAttachRecordToInboxThread();

    await expect(attachRecordToInboxThread(LINK_INPUT)).resolves.toBe(
      undefined,
    );

    const [url, requestInit] = fetchSpy.mock.calls[0];

    expect(url).toBe('https://api.test/metadata');

    const sentBody = JSON.parse(String(requestInit?.body));

    expect(sentBody.query).toContain('attachRecordToInboxThread(input:$v1)');
    expect(Object.values(sentBody.variables)).toEqual([LINK_INPUT]);
  });

  it('surfaces GraphQL errors as a rejection', async () => {
    fetchSpy.mockResolvedValue(
      graphqlResponse({ errors: [{ message: 'Record not found' }] }),
    );

    const attachRecordToInboxThread = await importAttachRecordToInboxThread();

    await expect(attachRecordToInboxThread(LINK_INPUT)).rejects.toThrow(
      /Record not found/,
    );
  });
});
