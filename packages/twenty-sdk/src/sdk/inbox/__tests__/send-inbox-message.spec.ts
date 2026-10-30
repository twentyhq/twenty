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
const MESSAGE_ID = '0d1e2f3a-4b5c-4f5a-8b9c-6f1d7c2a3b4e';

const SENT_RESULT = {
  threadId: THREAD_ID,
  messageId: MESSAGE_ID,
  isNewThread: true,
  isDismissed: false,
};

const importSendInboxMessage = async () => {
  const module = await import('@/sdk/inbox/send-inbox-message');

  return module.sendInboxMessage;
};

const graphqlResponse = (body: unknown) =>
  new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });

const successResponse = () =>
  graphqlResponse({ data: { sendInboxMessage: SENT_RESULT } });

const MESSAGE_INPUT = {
  workspaceMemberIds: ['20202020-0000-4000-8000-000000000001'],
  threadKey: 'thread',
  idempotencyKey: 'key',
  title: 'Title',
  text: 'Text',
};

const getSentAuthorizationHeader = (requestInit: RequestInit | undefined) =>
  new Headers(requestInit?.headers).get('authorization');

describe('sendInboxMessage', () => {
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
    vi.unstubAllGlobals();
    fetchSpy.mockRestore();
  });

  it('calls the sendInboxMessage mutation on the metadata API and returns the delivery', async () => {
    fetchSpy.mockResolvedValue(successResponse());

    const sendInboxMessage = await importSendInboxMessage();

    const input = {
      workspaceMemberIds: ['20202020-0000-4000-8000-000000000001'],
      threadKey: 'first-call-recording',
      idempotencyKey: 'first-call-recording',
      title: 'Your first recording is ready',
      text: 'Your call was recorded.',
      toolCall: {
        toolName: 'ask_question' as const,
        input: {
          header: 'Share',
          question: 'Share the recording with the attendees?',
          options: [{ label: 'Draft an email' }, { label: 'Not now' }],
        },
      },
    };

    const result = await sendInboxMessage(input);

    expect(result).toEqual(SENT_RESULT);

    const [url, requestInit] = fetchSpy.mock.calls[0];

    expect(url).toBe('https://api.test/metadata');

    const sentBody = JSON.parse(String(requestInit?.body));

    expect(sentBody.query).toContain(
      'sendInboxMessage(input:$v1){threadId,messageId,isNewThread,isDismissed}',
    );
    expect(Object.values(sentBody.variables)).toEqual([input]);
  });

  it('sends the access token of the person behind the run, like the default clients', async () => {
    vi.stubEnv('TWENTY_APP_ACCESS_TOKEN', 'member-token');
    fetchSpy.mockResolvedValue(successResponse());

    const sendInboxMessage = await importSendInboxMessage();

    await sendInboxMessage(MESSAGE_INPUT);

    const [, requestInit] = fetchSpy.mock.calls[0];

    expect(getSentAuthorizationHeader(requestInit)).toBe('Bearer member-token');
  });

  it('refreshes an expired front component token once and retries', async () => {
    vi.stubEnv('TWENTY_APP_APPLICATION_ACCESS_TOKEN', undefined);
    vi.stubEnv('TWENTY_APP_ACCESS_TOKEN', 'expired-token');
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

    const sendInboxMessage = await importSendInboxMessage();

    const result = await sendInboxMessage(MESSAGE_INPUT);

    expect(result).toEqual(SENT_RESULT);
    expect(requestAccessTokenRefresh).toHaveBeenCalledTimes(1);
    expect(
      fetchSpy.mock.calls.map(([, requestInit]) =>
        getSentAuthorizationHeader(requestInit),
      ),
    ).toEqual(['Bearer expired-token', 'Bearer refreshed-token']);
  });

  it('replies in an existing conversation, mentions members and attaches records as given', async () => {
    fetchSpy.mockResolvedValue(successResponse());

    const sendInboxMessage = await importSendInboxMessage();

    const input = {
      threadId: THREAD_ID,
      idempotencyKey: 'transcript-ready',
      text: 'The transcript is ready.',
      mentionedWorkspaceMemberIds: ['20202020-0000-4000-8000-000000000001'],
      recordTargets: [
        {
          objectNameSingular: 'company',
          recordId: '20202020-0000-4000-8000-000000000002',
        },
      ],
    };

    await sendInboxMessage(input);

    const [, requestInit] = fetchSpy.mock.calls[0];
    const sentBody = JSON.parse(String(requestInit?.body));

    expect(Object.values(sentBody.variables)).toEqual([input]);
  });

  it('surfaces GraphQL errors as a rejection', async () => {
    fetchSpy.mockResolvedValue(
      graphqlResponse({ errors: [{ message: 'Chat thread not found.' }] }),
    );

    const sendInboxMessage = await importSendInboxMessage();

    await expect(sendInboxMessage(MESSAGE_INPUT)).rejects.toThrow(
      /Chat thread not found/,
    );
  });
});
