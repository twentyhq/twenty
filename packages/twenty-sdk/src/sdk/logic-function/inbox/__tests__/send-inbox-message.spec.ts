import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
  type MockInstance,
} from 'vitest';

import { sendInboxMessage } from '@/sdk/logic-function/inbox/send-inbox-message';

describe('sendInboxMessage', () => {
  let fetchSpy: MockInstance<typeof fetch>;

  beforeEach(() => {
    process.env.TWENTY_API_URL = 'https://api.test';
    process.env.TWENTY_APP_APPLICATION_ACCESS_TOKEN = 'app-token';
    fetchSpy = vi.spyOn(globalThis, 'fetch');
  });

  afterEach(() => {
    delete process.env.TWENTY_API_URL;
    delete process.env.TWENTY_APP_APPLICATION_ACCESS_TOKEN;
    fetchSpy.mockRestore();
  });

  it('POSTs the sendInboxMessage mutation to /metadata and returns the thread', async () => {
    fetchSpy.mockResolvedValue(
      new Response(
        JSON.stringify({
          data: { sendInboxMessage: { threadId: 'thread-1' } },
        }),
        { status: 200 },
      ),
    );

    const input = {
      workspaceMemberId: 'member-1',
      threadKey: 'first-call-recording',
      idempotencyKey: 'first-call-recording',
      title: 'Your first recording is ready',
      text: 'Your call was recorded.',
      toolCall: {
        toolName: 'ask_questions' as const,
        input: {
          questions: [
            {
              header: 'Share',
              question: 'Share the recording with the attendees?',
              options: [{ label: 'Draft an email' }, { label: 'Not now' }],
            },
          ],
        },
      },
    };

    const result = await sendInboxMessage(input);

    expect(result).toEqual({ threadId: 'thread-1' });

    const [url, requestInit] = fetchSpy.mock.calls[0];

    expect(url).toBe('https://api.test/metadata');
    expect(requestInit).toEqual(
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: 'Bearer app-token',
        }),
      }),
    );

    const sentBody = JSON.parse(requestInit?.body as string);

    expect(sentBody.query).toContain('sendInboxMessage(input: $input)');
    expect(sentBody.variables).toEqual({ input });
  });

  it('surfaces GraphQL errors as a regular Error', async () => {
    fetchSpy.mockResolvedValue(
      new Response(
        JSON.stringify({ errors: [{ message: 'Chat thread not found.' }] }),
        { status: 200 },
      ),
    );

    await expect(
      sendInboxMessage({
        workspaceMemberId: 'member-1',
        threadKey: 'thread',
        idempotencyKey: 'key',
        title: 'Title',
        text: 'Text',
      }),
    ).rejects.toThrow(/Chat thread not found/);
  });
});
