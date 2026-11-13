import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
  type MockInstance,
} from 'vitest';

const ARCHIVE_INPUT = {
  threadId: '6f1d7c2a-3b4e-4f5a-8b9c-0d1e2f3a4b5c',
  workspaceMemberIds: ['20202020-0000-4000-8000-000000000003'],
};

const importArchiveInboxThread = async () => {
  const module = await import('@/sdk/inbox/archive-inbox-thread');

  return module.archiveInboxThread;
};

const graphqlResponse = (body: unknown) =>
  new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });

describe('archiveInboxThread', () => {
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

  it('calls the archiveInboxThread mutation on the metadata API', async () => {
    fetchSpy.mockResolvedValue(
      graphqlResponse({ data: { archiveInboxThread: true } }),
    );

    const archiveInboxThread = await importArchiveInboxThread();

    await expect(archiveInboxThread(ARCHIVE_INPUT)).resolves.toBe(undefined);

    expect(fetchSpy).toHaveBeenCalledTimes(1);

    const [url, requestInit] = fetchSpy.mock.calls[0];

    expect(url).toBe('https://api.test/metadata');

    const sentBody = JSON.parse(String(requestInit?.body));

    expect(sentBody.query).toContain('archiveInboxThread(input:$v1)');
    expect(Object.values(sentBody.variables)).toEqual([ARCHIVE_INPUT]);
  });

  it('surfaces GraphQL errors as a rejection', async () => {
    fetchSpy.mockResolvedValue(
      graphqlResponse({ errors: [{ message: 'Chat thread not found' }] }),
    );

    const archiveInboxThread = await importArchiveInboxThread();

    await expect(archiveInboxThread(ARCHIVE_INPUT)).rejects.toThrow(
      /Chat thread not found/,
    );
  });
});
