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

const importSendInboxMessage = async () => {
  const module = await import('@/sdk/inbox/send-inbox-message');

  return module.sendInboxMessage;
};

const graphqlResponse = (body: unknown) =>
  new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });

describe('sendInboxMessage', () => {
  let fetchSpy: MockInstance<typeof fetch>;

  beforeEach(() => {
    vi.resetModules();
    process.env.TWENTY_API_URL = 'https://api.test';
    process.env.TWENTY_APP_APPLICATION_ACCESS_TOKEN = 'app-token';
    fetchSpy = vi.spyOn(globalThis, 'fetch');
  });

  afterEach(() => {
    delete process.env.TWENTY_API_URL;
    delete process.env.TWENTY_APP_ACCESS_TOKEN;
    delete process.env.TWENTY_APP_APPLICATION_ACCESS_TOKEN;
    fetchSpy.mockRestore();
  });

  it('calls the sendInboxMessage mutation on the metadata API and returns the thread', async () => {
    fetchSpy.mockResolvedValue(
      graphqlResponse({ data: { sendInboxMessage: { threadId: THREAD_ID } } }),
    );

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

    expect(result).toEqual({ threadId: THREAD_ID });

    const [url, requestInit] = fetchSpy.mock.calls[0];

    expect(url).toBe('https://api.test/metadata');

    const sentBody = JSON.parse(requestInit?.body as string);

    expect(sentBody.query).toContain('sendInboxMessage(input:$v1){threadId}');
    expect(Object.values(sentBody.variables)).toEqual([input]);
  });

  it('sends the application access token as a bearer credential', async () => {
    process.env.TWENTY_APP_ACCESS_TOKEN = 'member-token';
    fetchSpy.mockResolvedValue(
      graphqlResponse({ data: { sendInboxMessage: { threadId: THREAD_ID } } }),
    );

    const sendInboxMessage = await importSendInboxMessage();

    await sendInboxMessage({
      workspaceMemberIds: ['20202020-0000-4000-8000-000000000001'],
      threadKey: 'thread',
      idempotencyKey: 'key',
      title: 'Title',
      text: 'Text',
    });

    const [, requestInit] = fetchSpy.mock.calls[0];

    expect(new Headers(requestInit?.headers).get('authorization')).toBe(
      'Bearer app-token',
    );
  });

  it('surfaces GraphQL errors as a rejection', async () => {
    fetchSpy.mockResolvedValue(
      graphqlResponse({ errors: [{ message: 'Chat thread not found.' }] }),
    );

    const sendInboxMessage = await importSendInboxMessage();

    await expect(
      sendInboxMessage({
        workspaceMemberIds: ['20202020-0000-4000-8000-000000000001'],
        threadKey: 'thread',
        idempotencyKey: 'key',
        title: 'Title',
        text: 'Text',
      }),
    ).rejects.toThrow(/Chat thread not found/);
  });
});
