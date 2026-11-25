import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
  type MockInstance,
} from 'vitest';

import { listConversationMessages } from '@/sdk/logic-function/agents/list-conversation-messages';
import { type AgentConversationHistory } from '@/sdk/logic-function/agents/types/agent-conversation.type';

const STREAM_CATCHUP = { chunks: [], maxSeq: 0, error: null };

const RESPONSE = {
  messages: [
    {
      id: 'message-id',
      threadId: 'thread-id',
      turnId: 'run-id',
      senderWorkspaceMemberId: null,
      role: 'assistant',
      status: 'sent',
      createdAt: '2026-10-31T10:00:00.000Z',
      processedAt: '2026-10-31T10:00:02.000Z',
      parts: [
        { orderIndex: 1, type: 'text', textContent: 'Acme is a fit.' },
        { orderIndex: 0, type: 'step-start' },
      ],
    },
  ],
  streamCatchup: STREAM_CATCHUP,
};

const HISTORY: AgentConversationHistory = {
  messages: [
    {
      id: 'message-id',
      role: 'assistant',
      parts: [{ type: 'step-start' }, { type: 'text', text: 'Acme is a fit.' }],
      metadata: {
        createdAt: '2026-10-31T10:00:00.000Z',
        senderWorkspaceMemberId: null,
        turnId: 'run-id',
        startedAt: '2026-10-31T10:00:00.000Z',
        finishedAt: '2026-10-31T10:00:02.000Z',
      },
    },
  ],
  streamCatchup: STREAM_CATCHUP,
};

describe('listConversationMessages', () => {
  let fetchSpy: MockInstance<typeof fetch>;

  beforeEach(() => {
    vi.stubEnv('TWENTY_API_URL', 'https://api.test');
    vi.stubEnv('TWENTY_APP_ACCESS_TOKEN', 'app-token');
    fetchSpy = vi.spyOn(globalThis, 'fetch');
    fetchSpy.mockResolvedValue(
      new Response(JSON.stringify({ data: RESPONSE }), { status: 200 }),
    );
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    fetchSpy.mockRestore();
  });

  it('reads the history of a conversation by agent and thread key as UI messages', async () => {
    const conversation = {
      agentUniversalIdentifier: 'agent-uid',
      threadKey: 'C123:1700000000.000100',
    };

    expect(await listConversationMessages(conversation)).toMatchObject(HISTORY);

    const [url, requestInit] = fetchSpy.mock.calls[0];
    const sentBody = JSON.parse(String(requestInit?.body));

    expect(url).toBe('https://api.test/metadata');
    expect(sentBody.query).toContain('chatMessages(');
    expect(sentBody.query).toContain('chatStreamCatchupChunks(');
    expect(sentBody.variables).toEqual(conversation);
  });
});
