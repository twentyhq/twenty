import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createCoreClientFake } from 'src/__tests__/utils/create-core-client-fake';
import { stubTelegramApi } from 'src/__tests__/utils/stub-telegram-api';
import {
  TELEGRAM_ASSISTANT_AGENT_UNIVERSAL_IDENTIFIER,
  TELEGRAM_LATE_ANSWER_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';
import { TELEGRAM_ASSISTANT_AGENT_BUDGET_SECONDS } from 'src/logic-functions/constants/telegram-assistant-agent-budget-seconds';
import { TELEGRAM_ASSISTANT_ATTACHMENT_REFUSED_TEXT } from 'src/logic-functions/constants/telegram-assistant-attachment-refused-text';
import { TELEGRAM_ASSISTANT_DEADLINE_FAILURE_TEXT } from 'src/logic-functions/constants/telegram-assistant-deadline-failure-text';
import { TELEGRAM_ASSISTANT_EMPTY_RESPONSE_FAILURE_TEXT } from 'src/logic-functions/constants/telegram-assistant-empty-response-failure-text';
import { TELEGRAM_ASSISTANT_FAILURE_TEXT } from 'src/logic-functions/constants/telegram-assistant-failure-text';
import { TELEGRAM_ASSISTANT_HELP_TEXT } from 'src/logic-functions/constants/telegram-assistant-help-text';
import { TELEGRAM_ASSISTANT_STILL_RUNNING_TEXT } from 'src/logic-functions/constants/telegram-assistant-still-running-text';
import { TELEGRAM_FEEDBACK_NOT_SAVED_TEXT } from 'src/logic-functions/constants/telegram-feedback-not-saved-text';
import { TELEGRAM_FEEDBACK_SAVED_TEXT } from 'src/logic-functions/constants/telegram-feedback-saved-text';
import { TELEGRAM_LATE_ANSWER_CHECK_DELAY_MS } from 'src/logic-functions/constants/telegram-late-answer-check-delay-ms';
import { TELEGRAM_LATE_ANSWER_GIVE_UP_AFTER_MS } from 'src/logic-functions/constants/telegram-late-answer-give-up-after-ms';
import { telegramLateAnswerHandler } from 'src/logic-functions/telegram-late-answer';
import { telegramUpdateHandler } from 'src/logic-functions/telegram-update-handler';

const { clientHolder, runAgentMock, enqueueJobsMock, conversationMock } =
  vi.hoisted(() => {
    const clientHolder: {
      client?: ReturnType<typeof createCoreClientFake>['client'];
    } = {};

    return {
      clientHolder,
      runAgentMock: vi.fn(),
      enqueueJobsMock: vi.fn(),
      conversationMock: vi.fn(),
    };
  });

vi.mock('twenty-sdk/logic-function', async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  kv: { delete: vi.fn() },
  runAgent: runAgentMock,
  enqueueJobs: enqueueJobsMock,
  listConversationMessages: conversationMock,
}));

vi.mock('twenty-client-sdk/core', () => ({
  CoreApiClient: vi.fn(function () {
    return clientHolder.client;
  }),
}));

vi.mock('twenty-client-sdk/metadata', () => ({
  MetadataApiClient: vi.fn(function () {
    return {
      mutation: async (mutation: object) =>
        'createFileUpload' in mutation
          ? {
              createFileUpload: {
                fileId: 'file-1',
                uploadUrl: 'https://twenty.example/file-upload/file-1',
                contentType: 'application/octet-stream',
              },
            }
          : { completeFileUpload: { id: 'file-1' } },
    };
  }),
}));

vi.mock('src/logic-functions/utils/fetch-workspace-base-url', () => ({
  fetchWorkspaceBaseUrl: async () => 'https://acme.twenty.example',
}));

const CHAT_ID = 42;
const ANSWER = 'You have **3 open deals**.';

const FEEDBACK_KEYBOARD = {
  inline_keyboard: [
    [
      { text: '\u{1F44D}', callback_data: 'feedback:POSITIVE:request-1' },
      { text: '\u{1F44E}', callback_data: 'feedback:NEGATIVE:request-1' },
    ],
  ],
};

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
    enqueueJobsMock.mockReset();
    conversationMock.mockReset();
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
        thread: { key: 'request-1', title: 'How many open deals?' },
        input: 'How many open deals?',
      }),
    );
    expect(callsTo('sendChatAction')[0].params).toEqual({
      chat_id: CHAT_ID,
      action: 'typing',
    });
    expect(callsTo('sendRichMessage').map((call) => call.params)).toEqual([
      {
        chat_id: CHAT_ID,
        rich_message: { markdown: ANSWER },
        reply_markup: FEEDBACK_KEYBOARD,
      },
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

    expect(runAgentMock.mock.calls[1][0]).toMatchObject({
      input: 'And the biggest one?',
      additionalInstructions: expect.stringContaining(
        `Member: How many open deals?\nYou: ${ANSWER}`,
      ),
    });
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

  it('tells the member to wait and schedules a late answer when the agent outlasts the deadline', async () => {
    runAgentMock.mockReturnValue(new Promise(() => undefined));

    const pending = send({ text: 'How many open deals?' });

    await vi.advanceTimersByTimeAsync(
      TELEGRAM_ASSISTANT_AGENT_BUDGET_SECONDS * 1000,
    );

    await expect(pending).resolves.toEqual({ outcome: 'STILL_RUNNING' });
    expect(callsTo('sendMessage').map((call) => call.params.text)).toEqual([
      TELEGRAM_ASSISTANT_STILL_RUNNING_TEXT,
    ]);
    expect(coreFake.state.requests[0]).toMatchObject({
      status: 'STILL_RUNNING',
    });
    expect(enqueueJobsMock).toHaveBeenCalledWith({
      logicFunctionUniversalIdentifier:
        TELEGRAM_LATE_ANSWER_UNIVERSAL_IDENTIFIER,
      jobs: [
        {
          payload: {
            requestId: 'request-1',
            chatId: CHAT_ID,
            giveUpAtMs: Date.now() + TELEGRAM_LATE_ANSWER_GIVE_UP_AFTER_MS,
          },
        },
      ],
      delayMs: TELEGRAM_LATE_ANSWER_CHECK_DELAY_MS,
    });

    const typingCallCount = callsTo('sendChatAction').length;

    await vi.advanceTimersByTimeAsync(60_000);

    expect(typingCallCount).toBeGreaterThan(10);
    expect(callsTo('sendChatAction')).toHaveLength(typingCallCount);
  });

  it('records a failure when the late answer cannot be scheduled', async () => {
    runAgentMock.mockReturnValue(new Promise(() => undefined));
    enqueueJobsMock.mockRejectedValue(new Error('queue unavailable'));

    const pending = send({ text: 'How many open deals?' });

    await vi.advanceTimersByTimeAsync(
      TELEGRAM_ASSISTANT_AGENT_BUDGET_SECONDS * 1000,
    );

    await expect(pending).resolves.toEqual({ outcome: 'FAILED' });
    expect(callsTo('sendMessage').map((call) => call.params.text)).toEqual([
      TELEGRAM_ASSISTANT_DEADLINE_FAILURE_TEXT,
    ]);
    expect(coreFake.state.requests[0]).toMatchObject({ status: 'FAILED' });
  });

  describe('once the agent has outlasted the deadline', () => {
    const latePayload = () => enqueueJobsMock.mock.calls[0][0].jobs[0].payload;

    const conversation = ({
      texts = [],
      chunks = [],
      error = null,
    }: {
      texts?: string[];
      chunks?: object[];
      error?: { code: string; message: string } | null;
    }) => ({
      messages: [
        { id: 'm1', role: 'user', parts: [{ type: 'text', text: 'prompt' }] },
        ...(texts.length > 0
          ? [
              {
                id: 'm2',
                role: 'assistant',
                parts: [
                  { type: 'tool-find_companies' },
                  ...texts.map((text) => ({ type: 'text', text })),
                ],
              },
            ]
          : []),
      ],
      streamCatchup: { chunks, maxSeq: chunks.length, error },
    });

    beforeEach(async () => {
      runAgentMock.mockReturnValue(new Promise(() => undefined));

      const pending = send({ text: 'How many open deals?' });

      await vi.advanceTimersByTimeAsync(
        TELEGRAM_ASSISTANT_AGENT_BUDGET_SECONDS * 1000,
      );
      await pending;
      telegramCalls.length = 0;
    });

    it('checks again later while the run is still streaming', async () => {
      conversationMock.mockResolvedValue(
        conversation({ texts: ['Looking'], chunks: [{ type: 'text-delta' }] }),
      );

      await expect(telegramLateAnswerHandler(latePayload())).resolves.toEqual({
        outcome: 'STILL_RUNNING',
      });
      expect(enqueueJobsMock).toHaveBeenCalledTimes(2);
      expect(telegramCalls).toEqual([]);
      expect(coreFake.state.requests[0]).toMatchObject({
        status: 'STILL_RUNNING',
      });
    });

    it('sends the answer the run ended with, once', async () => {
      conversationMock.mockResolvedValue(
        conversation({ texts: ['Let me look that up.', ANSWER] }),
      );

      const outcomes = await Promise.all([
        telegramLateAnswerHandler(latePayload()),
        telegramLateAnswerHandler(latePayload()),
      ]);

      expect(outcomes.map(({ outcome }) => outcome).sort()).toEqual([
        'ANSWERED',
        'SKIPPED',
      ]);
      expect(callsTo('sendRichMessage').map((call) => call.params)).toEqual([
        {
          chat_id: CHAT_ID,
          rich_message: { markdown: ANSWER },
          reply_markup: FEEDBACK_KEYBOARD,
        },
      ]);
      expect(coreFake.state.requests[0]).toMatchObject({
        status: 'DONE',
        responseText: { blocknote: null, markdown: ANSWER },
      });
    });

    it('reports the failure the run ended with', async () => {
      conversationMock.mockResolvedValue(
        conversation({
          error: { code: 'STREAM_EXECUTION_FAILED', message: 'model down' },
        }),
      );

      await expect(telegramLateAnswerHandler(latePayload())).resolves.toEqual({
        outcome: 'FAILED',
      });
      expect(callsTo('sendMessage').map((call) => call.params.text)).toEqual([
        TELEGRAM_ASSISTANT_FAILURE_TEXT,
      ]);
      expect(coreFake.state.requests[0]).toMatchObject({
        status: 'FAILED',
        errorMessage: 'model down',
      });
    });

    it('gives up when the run shows no outcome by the end of the wait', async () => {
      conversationMock.mockResolvedValue(conversation({}));

      await vi.advanceTimersByTimeAsync(TELEGRAM_LATE_ANSWER_GIVE_UP_AFTER_MS);

      await expect(telegramLateAnswerHandler(latePayload())).resolves.toEqual({
        outcome: 'FAILED',
      });
      expect(callsTo('sendMessage').map((call) => call.params.text)).toEqual([
        TELEGRAM_ASSISTANT_DEADLINE_FAILURE_TEXT,
      ]);
      expect(coreFake.state.requests[0]).toMatchObject({ status: 'FAILED' });
    });
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
      { chat_id: CHAT_ID, text: ANSWER, reply_markup: FEEDBACK_KEYBOARD },
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

  it('records the failure instead of waiting on a rate limit past the time left to deliver', async () => {
    telegramCalls = stubTelegramApi({
      failures: {
        sendRichMessage: [
          {
            error_code: 429,
            description: 'Too Many Requests: retry after 20',
            parameters: { retry_after: 20 },
          },
        ],
      },
    });
    runAgentMock.mockReturnValue(
      new Promise((resolve) =>
        setTimeout(
          () => resolve(completedRun(ANSWER)),
          (TELEGRAM_ASSISTANT_AGENT_BUDGET_SECONDS - 1) * 1000,
        ),
      ),
    );

    const pending = send({ text: 'How many open deals?' });

    await vi.advanceTimersByTimeAsync(
      (TELEGRAM_ASSISTANT_AGENT_BUDGET_SECONDS - 1) * 1000,
    );

    await expect(pending).resolves.toEqual({ outcome: 'FAILED' });
    expect(callsTo('sendRichMessage')).toHaveLength(1);
    expect(coreFake.state.requests[0]).toMatchObject({ status: 'FAILED' });
  });

  describe('rating an answer', () => {
    const tap = ({
      data,
      userId = CHAT_ID,
    }: {
      data: string;
      userId?: number;
    }) =>
      telegramUpdateHandler(
        {
          update: {
            callback_query: {
              id: 'callback-1',
              from: { id: userId, first_name: 'Ada' },
              data,
            },
          },
        },
        { workspaceId: 'workspace-1' },
      );

    beforeEach(async () => {
      await send({ text: 'How many open deals?' });
    });

    it('saves the thumb the member tapped and lets them change it', async () => {
      await expect(
        tap({ data: 'feedback:POSITIVE:request-1' }),
      ).resolves.toEqual({ outcome: 'FEEDBACK_SAVED' });
      expect(coreFake.state.requests[0]).toMatchObject({
        feedback: 'POSITIVE',
      });
      expect(callsTo('answerCallbackQuery').map((call) => call.params)).toEqual(
        [
          {
            callback_query_id: 'callback-1',
            text: TELEGRAM_FEEDBACK_SAVED_TEXT,
          },
        ],
      );

      await tap({ data: 'feedback:NEGATIVE:request-1' });

      expect(coreFake.state.requests[0]).toMatchObject({
        feedback: 'NEGATIVE',
      });
    });

    it('does not let another account rate the answer', async () => {
      await expect(
        tap({ data: 'feedback:NEGATIVE:request-1', userId: 43 }),
      ).resolves.toEqual({ outcome: 'FEEDBACK_NOT_SAVED' });
      expect(coreFake.state.requests[0].feedback).toBeUndefined();
      expect(callsTo('answerCallbackQuery')[0].params.text).toBe(
        TELEGRAM_FEEDBACK_NOT_SAVED_TEXT,
      );
    });
  });

  describe('reading an attached photo or PDF', () => {
    const PDF = {
      file_id: 'doc-1',
      file_name: 'invoice.pdf',
      mime_type: 'application/pdf',
      file_size: 20_000,
    };

    const sendFile = (message: object) =>
      telegramUpdateHandler(
        {
          update: {
            message: {
              message_id: 1,
              chat: { id: CHAT_ID, type: 'private' },
              from: { id: CHAT_ID, first_name: 'Ada' },
              ...message,
            },
          },
        },
        { workspaceId: 'workspace-1' },
      );

    it('gives the agent the file along with the caption', async () => {
      telegramCalls = stubTelegramApi({
        results: { getFile: { file_path: 'documents/file_1.pdf' } },
      });

      await expect(
        sendFile({ caption: 'What is the total?', document: PDF }),
      ).resolves.toEqual({ outcome: 'ANSWERED' });
      expect(callsTo('getFile').map((call) => call.params)).toEqual([
        { file_id: 'doc-1' },
      ]);
      expect(callsTo('uploadFile')).toHaveLength(1);
      expect(runAgentMock.mock.calls[0][0].input).toEqual([
        {
          role: 'user',
          content: 'What is the total?',
          attachments: [{ fileId: 'file-1', filename: 'invoice.pdf' }],
        },
      ]);
    });

    it('records a file sent without a caption under its name', async () => {
      telegramCalls = stubTelegramApi({
        results: { getFile: { file_path: 'photos/file_2.jpg' } },
      });

      await sendFile({ photo: [{ file_id: 'photo-1', file_size: 5000 }] });

      expect(coreFake.state.requests[0]).toMatchObject({
        status: 'DONE',
        name: 'photo.jpg',
      });
    });

    it('still answers from the text when the file cannot be fetched', async () => {
      telegramCalls = stubTelegramApi({
        failures: {
          getFile: [{ error_code: 400, description: 'Bad Request: file' }],
        },
      });

      await expect(
        sendFile({ caption: 'What is the total?', document: PDF }),
      ).resolves.toEqual({ outcome: 'ANSWERED' });
      expect(runAgentMock.mock.calls[0][0]).toMatchObject({
        input: 'What is the total?',
        additionalInstructions: expect.stringContaining('invoice.pdf'),
      });
    });

    it.each([
      { ...PDF, mime_type: 'application/zip' },
      { ...PDF, file_size: 11 * 1024 * 1024 },
    ])(
      'refuses a file of another type or over the size limit',
      async (document) => {
        await expect(sendFile({ document })).resolves.toEqual({
          outcome: 'ATTACHMENT_REFUSED',
        });
        expect(callsTo('sendMessage').map((call) => call.params.text)).toEqual([
          TELEGRAM_ASSISTANT_ATTACHMENT_REFUSED_TEXT,
        ]);
        expect(runAgentMock).not.toHaveBeenCalled();
        expect(coreFake.state.requests).toEqual([]);
      },
    );
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
