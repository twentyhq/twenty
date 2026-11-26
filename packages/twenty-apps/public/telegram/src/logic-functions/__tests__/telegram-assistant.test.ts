import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createCoreClientFake } from 'src/__tests__/utils/create-core-client-fake';
import { stubTelegramApi } from 'src/__tests__/utils/stub-telegram-api';
import { TELEGRAM_ASSISTANT_AGENT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { TELEGRAM_ASSISTANT_AGENT_BUDGET_SECONDS } from 'src/logic-functions/constants/telegram-assistant-agent-budget-seconds';
import { TELEGRAM_ASSISTANT_DEADLINE_FAILURE_TEXT } from 'src/logic-functions/constants/telegram-assistant-deadline-failure-text';
import { TELEGRAM_ASSISTANT_EMPTY_RESPONSE_FAILURE_TEXT } from 'src/logic-functions/constants/telegram-assistant-empty-response-failure-text';
import { TELEGRAM_ASSISTANT_FAILURE_TEXT } from 'src/logic-functions/constants/telegram-assistant-failure-text';
import { TELEGRAM_ASSISTANT_HELP_TEXT } from 'src/logic-functions/constants/telegram-assistant-help-text';
import { TELEGRAM_ASSISTANT_TEXT_ONLY_TEXT } from 'src/logic-functions/constants/telegram-assistant-text-only-text';
import { telegramUpdateHandler } from 'src/logic-functions/telegram-update-handler';

const { clientHolder, runAgentMock } = vi.hoisted(() => {
  const clientHolder: {
    client?: ReturnType<typeof createCoreClientFake>['client'];
  } = {};

  return { clientHolder, runAgentMock: vi.fn() };
});

vi.mock('twenty-sdk/logic-function', async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  kv: { delete: vi.fn() },
  runAgent: runAgentMock,
}));

vi.mock('twenty-client-sdk/core', () => ({
  CoreApiClient: vi.fn(function () {
    return clientHolder.client;
  }),
}));

vi.mock('src/logic-functions/utils/fetch-workspace-base-url', () => ({
  fetchWorkspaceBaseUrl: async () => 'https://acme.twenty.example',
}));

const CHAT_ID = 42;
const ANSWER = 'You have **3 open deals**.';

const completedRun = (response: string) => ({
  success: true,
  result: { response },
  error: null,
});

describe('answering a question from Telegram', () => {
  let coreFake: ReturnType<typeof createCoreClientFake>;
  let telegramCalls: ReturnType<typeof stubTelegramApi>;

  const send = ({
    text,
    messageId = 1,
  }: {
    text: string | undefined;
    messageId?: number;
  }) =>
    telegramUpdateHandler(
      {
        update: {
          message: {
            message_id: messageId,
            chat: { id: CHAT_ID, type: 'private' },
            from: { id: CHAT_ID, first_name: 'Ada' },
            text,
          },
        },
      },
      { workspaceId: 'workspace-1' },
    );

  const callsTo = (method: string) =>
    telegramCalls.filter((call) => call.method === method);

  beforeEach(() => {
    vi.useFakeTimers({ now: new Date('2026-11-26T10:00:00.000Z') });
    vi.stubEnv('TELEGRAM_BOT_TOKEN', '123:bot-token');
    vi.stubEnv('TELEGRAM_WEBHOOK_SECRET', 'webhook-secret');
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    coreFake = createCoreClientFake({
      links: [
        { id: 'link-1', telegramUserId: '42', workspaceMemberId: 'member-1' },
      ],
    });
    clientHolder.client = coreFake.client;
    telegramCalls = stubTelegramApi();
    runAgentMock.mockReset();
    runAgentMock.mockResolvedValue(completedRun(ANSWER));
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('runs the agent as the linked member and sends the answer as a rich message', async () => {
    await expect(send({ text: 'How many open deals?' })).resolves.toEqual({
      outcome: 'ANSWERED',
    });

    expect(runAgentMock).toHaveBeenCalledWith(
      expect.objectContaining({
        agentUniversalIdentifier: TELEGRAM_ASSISTANT_AGENT_UNIVERSAL_IDENTIFIER,
        runAsWorkspaceMemberId: 'member-1',
      }),
    );
    expect(callsTo('sendChatAction')[0].params).toEqual({
      chat_id: CHAT_ID,
      action: 'typing',
    });
    expect(callsTo('sendRichMessage').map((call) => call.params)).toEqual([
      { chat_id: CHAT_ID, rich_message: { markdown: ANSWER } },
    ]);
    expect(coreFake.state.requests).toEqual([
      expect.objectContaining({
        status: 'DONE',
        name: 'How many open deals?',
        telegramChatId: '42',
        telegramMessageId: '1',
        workspaceMemberId: 'member-1',
        requestText: { blocknote: null, markdown: 'How many open deals?' },
        responseText: { blocknote: null, markdown: ANSWER },
      }),
    ]);
  });

  it('gives the agent the earlier turns of the chat', async () => {
    await send({ text: 'How many open deals?', messageId: 1 });
    await send({ text: 'And the biggest one?', messageId: 2 });

    const messages = runAgentMock.mock.calls[1][0].input;

    expect(messages.slice(0, 2)).toEqual([
      { role: 'user', content: 'How many open deals?' },
      { role: 'assistant', content: ANSWER },
    ]);
    expect(messages[2].content).toContain(
      'Request from Telegram:\nAnd the biggest one?',
    );
  });

  it('answers a message once when Telegram delivers it twice at the same time', async () => {
    const outcomes = await Promise.all([
      send({ text: 'How many open deals?' }),
      send({ text: 'How many open deals?' }),
    ]);

    expect(outcomes.map(({ outcome }) => outcome).sort()).toEqual([
      'ANSWERED',
      'SKIPPED',
    ]);
    expect(runAgentMock).toHaveBeenCalledTimes(1);
    expect(callsTo('sendRichMessage')).toHaveLength(1);
    expect(coreFake.state.requests).toHaveLength(1);
  });

  it('does not answer again a message it already answered', async () => {
    await send({ text: 'How many open deals?' });

    await expect(send({ text: 'How many open deals?' })).resolves.toEqual({
      outcome: 'SKIPPED',
    });
    expect(runAgentMock).toHaveBeenCalledTimes(1);
  });

  it('tells the member when the agent fails and records why', async () => {
    runAgentMock.mockResolvedValue({
      success: false,
      result: null,
      error: 'model unavailable',
    });

    await expect(send({ text: 'How many open deals?' })).resolves.toEqual({
      outcome: 'FAILED',
    });
    expect(callsTo('sendMessage').map((call) => call.params.text)).toEqual([
      TELEGRAM_ASSISTANT_FAILURE_TEXT,
    ]);
    expect(coreFake.state.requests[0]).toMatchObject({
      status: 'FAILED',
      errorMessage: 'model unavailable',
    });
  });

  it('asks the member to try again when the agent finishes without an answer', async () => {
    runAgentMock.mockResolvedValue(completedRun('  '));

    await expect(send({ text: 'How many open deals?' })).resolves.toEqual({
      outcome: 'FAILED',
    });
    expect(callsTo('sendMessage').map((call) => call.params.text)).toEqual([
      TELEGRAM_ASSISTANT_EMPTY_RESPONSE_FAILURE_TEXT,
    ]);
  });

  it('does not send a failure reply when the answer was delivered but could not be saved', async () => {
    const mutate = coreFake.client.mutation;

    vi.spyOn(coreFake.client, 'mutation').mockImplementation(
      async (mutation) => {
        if ('updateTelegramAssistantRequest' in mutation) {
          throw new Error('database unavailable');
        }

        return mutate(mutation);
      },
    );

    await expect(send({ text: 'How many open deals?' })).resolves.toEqual({
      outcome: 'ANSWERED',
    });
    expect(callsTo('sendRichMessage')).toHaveLength(1);
    expect(callsTo('sendMessage')).toEqual([]);
  });

  it('stops waiting for the agent at the deadline and stops the typing status', async () => {
    runAgentMock.mockReturnValue(new Promise(() => undefined));

    const pending = send({ text: 'How many open deals?' });

    await vi.advanceTimersByTimeAsync(
      TELEGRAM_ASSISTANT_AGENT_BUDGET_SECONDS * 1000,
    );

    await expect(pending).resolves.toEqual({ outcome: 'FAILED' });
    expect(callsTo('sendMessage').map((call) => call.params.text)).toEqual([
      TELEGRAM_ASSISTANT_DEADLINE_FAILURE_TEXT,
    ]);

    const typingCallCount = callsTo('sendChatAction').length;

    await vi.advanceTimersByTimeAsync(60_000);

    expect(typingCallCount).toBeGreaterThan(10);
    expect(callsTo('sendChatAction')).toHaveLength(typingCallCount);
  });

  it('sends plain text when Telegram refuses the rich message', async () => {
    telegramCalls = stubTelegramApi({
      failures: {
        sendRichMessage: [
          { error_code: 400, description: 'Bad Request: cannot parse' },
        ],
      },
    });

    await expect(send({ text: 'How many open deals?' })).resolves.toEqual({
      outcome: 'ANSWERED',
    });
    expect(callsTo('sendMessage').map((call) => call.params)).toEqual([
      { chat_id: CHAT_ID, text: ANSWER },
    ]);
  });

  it('waits and sends again when Telegram rate limits the answer', async () => {
    telegramCalls = stubTelegramApi({
      failures: {
        sendRichMessage: [
          {
            error_code: 429,
            description: 'Too Many Requests: retry after 3',
            parameters: { retry_after: 3 },
          },
        ],
      },
    });

    const pending = send({ text: 'How many open deals?' });

    await vi.advanceTimersByTimeAsync(3000);

    await expect(pending).resolves.toEqual({ outcome: 'ANSWERED' });
    expect(callsTo('sendRichMessage')).toHaveLength(2);
    expect(callsTo('sendMessage')).toEqual([]);
  });

  it('asks for text when the message has none, without running the agent', async () => {
    await expect(send({ text: undefined })).resolves.toEqual({
      outcome: 'TEXT_ONLY',
    });
    expect(callsTo('sendMessage').map((call) => call.params.text)).toEqual([
      TELEGRAM_ASSISTANT_TEXT_ONLY_TEXT,
    ]);
    expect(runAgentMock).not.toHaveBeenCalled();
  });

  it('answers a command with the help text, without running the agent', async () => {
    await expect(send({ text: '/help' })).resolves.toEqual({
      outcome: 'CONNECTED',
    });
    expect(callsTo('sendMessage').map((call) => call.params.text)).toEqual([
      TELEGRAM_ASSISTANT_HELP_TEXT,
    ]);
    expect(runAgentMock).not.toHaveBeenCalled();
  });
});
