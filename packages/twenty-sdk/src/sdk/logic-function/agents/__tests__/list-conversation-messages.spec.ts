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

const HISTORY: AgentConversationHistory = {
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
      parts: [],
      reactions: [],
    },
  ],
  streamCatchup: { chunks: [], maxSeq: 0, error: null },
};

describe('listConversationMessages', () => {
  let fetchSpy: MockInstance<typeof fetch>;

  beforeEach(() => {
    vi.stubEnv('TWENTY_API_URL', 'https://api.test');
    vi.stubEnv('TWENTY_APP_ACCESS_TOKEN', 'app-token');
    fetchSpy = vi.spyOn(globalThis, 'fetch');
    fetchSpy.mockResolvedValue(
      new Response(JSON.stringify({ data: HISTORY }), { status: 200 }),
    );
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    fetchSpy.mockRestore();
  });

  it('reads the chat history and stream catch-up of a conversation by agent and thread key', async () => {
    const conversation = {
      agentUniversalIdentifier: 'agent-uid',
      threadKey: 'C123:1700000000.000100',
    };

    expect(await listConversationMessages(conversation)).toEqual(HISTORY);

    const [url, requestInit] = fetchSpy.mock.calls[0];
    const sentBody = JSON.parse(String(requestInit?.body));

    expect(url).toBe('https://api.test/metadata');
    expect(sentBody.query).toContain('chatMessages(');
    expect(sentBody.query).toContain('chatStreamCatchupChunks(');
    expect(sentBody.variables).toEqual(conversation);
  });
});
