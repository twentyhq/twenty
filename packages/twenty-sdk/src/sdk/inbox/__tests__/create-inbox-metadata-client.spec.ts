import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
  type MockInstance,
} from 'vitest';

const THREAD_ID = '6f1d7c2a-3b4e-4f5a-8b9c-0d1e2f3a4b5c';

const SEND_INBOX_MESSAGE_SELECTION = {
  sendInboxMessage: {
    __args: {
      input: {
        workspaceMemberIds: ['20202020-0000-4000-8000-000000000001'],
        threadKey: 'thread-key',
        idempotencyKey: 'idempotency-key',
        title: 'Title',
        text: 'Text',
      },
    },
    threadId: true,
  },
};

const importCreateInboxMetadataClient = async () => {
  const module = await import('@/sdk/inbox/create-inbox-metadata-client');

  return module.createInboxMetadataClient;
};

const successResponse = () =>
  new Response(
    JSON.stringify({ data: { sendInboxMessage: { threadId: THREAD_ID } } }),
    { status: 200, headers: { 'Content-Type': 'application/json' } },
  );

const getSentAuthorizationHeader = (requestInit: RequestInit | undefined) =>
  new Headers(requestInit?.headers).get('authorization');

describe('createInboxMetadataClient', () => {
  const initialEnvironment = process.env;
  let fetchSpy: MockInstance<typeof fetch>;

  beforeEach(() => {
    vi.resetModules();
    process.env = {
      ...initialEnvironment,
      TWENTY_API_URL: 'https://api.test',
    };
    delete process.env.TWENTY_APP_ACCESS_TOKEN;
    delete process.env.TWENTY_APP_APPLICATION_ACCESS_TOKEN;
    fetchSpy = vi.spyOn(globalThis, 'fetch');
  });

  afterEach(() => {
    process.env = initialEnvironment;
    fetchSpy.mockRestore();
    vi.unstubAllGlobals();
  });

  it('sends the application token as the bearer for APPLICATION', async () => {
    process.env.TWENTY_APP_APPLICATION_ACCESS_TOKEN = 'application-token';
    process.env.TWENTY_APP_ACCESS_TOKEN = 'member-token';
    fetchSpy.mockResolvedValue(successResponse());

    const createInboxMetadataClient = await importCreateInboxMetadataClient();

    await createInboxMetadataClient({ sender: 'APPLICATION' }).mutation(
      SEND_INBOX_MESSAGE_SELECTION,
    );

    const [url, requestInit] = fetchSpy.mock.calls[0];

    expect(url).toBe('https://api.test/metadata');
    expect(getSentAuthorizationHeader(requestInit)).toBe(
      'Bearer application-token',
    );
  });

  it('sends the member token as the bearer for CURRENT_MEMBER', async () => {
    process.env.TWENTY_APP_APPLICATION_ACCESS_TOKEN = 'application-token';
    process.env.TWENTY_APP_ACCESS_TOKEN = 'member-token';
    fetchSpy.mockResolvedValue(successResponse());

    const createInboxMetadataClient = await importCreateInboxMetadataClient();

    await createInboxMetadataClient({ sender: 'CURRENT_MEMBER' }).mutation(
      SEND_INBOX_MESSAGE_SELECTION,
    );

    const [, requestInit] = fetchSpy.mock.calls[0];

    expect(getSentAuthorizationHeader(requestInit)).toBe('Bearer member-token');
  });

  it('refuses CURRENT_MEMBER before any request when nobody is behind the run', async () => {
    process.env.TWENTY_APP_APPLICATION_ACCESS_TOKEN = 'application-token';
    process.env.TWENTY_APP_ACCESS_TOKEN = 'application-token';

    const createInboxMetadataClient = await importCreateInboxMetadataClient();

    expect(() =>
      createInboxMetadataClient({ sender: 'CURRENT_MEMBER' }),
    ).toThrow(/Cron schedules, install hooks and unauthenticated webhooks/);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('refreshes the token through the front component host after a 401 and retries once', async () => {
    process.env.TWENTY_APP_ACCESS_TOKEN = 'expired-token';
    const requestAccessTokenRefresh = vi
      .fn()
      .mockResolvedValue('refreshed-token');

    vi.stubGlobal('frontComponentHostCommunicationApi', {
      requestAccessTokenRefresh,
    });
    fetchSpy
      .mockResolvedValueOnce(
        new Response('Unauthorized', {
          status: 401,
          statusText: 'Unauthorized',
        }),
      )
      .mockResolvedValueOnce(successResponse());

    const createInboxMetadataClient = await importCreateInboxMetadataClient();

    const result = await createInboxMetadataClient({
      sender: 'APPLICATION',
    }).mutation(SEND_INBOX_MESSAGE_SELECTION);

    expect(result).toEqual({ sendInboxMessage: { threadId: THREAD_ID } });
    expect(requestAccessTokenRefresh).toHaveBeenCalledTimes(1);
    expect(
      fetchSpy.mock.calls.map(([, requestInit]) =>
        getSentAuthorizationHeader(requestInit),
      ),
    ).toEqual(['Bearer expired-token', 'Bearer refreshed-token']);
  });
});
