import { type AgentChatThreadRecord } from '@/ai/types/AgentChatThreadRecord';
import { applyAgentChatThreadLiveFields } from '@/ai/utils/applyAgentChatThreadLiveFields';

const THREAD: AgentChatThreadRecord = {
  __typename: 'AgentChatThread',
  id: 'thread',
  title: 'Loaded title',
  lastMessageText: 'Loaded message',
  deletedAt: null,
  createdAt: '2026-11-01T00:00:00.000Z',
  updatedAt: '2026-11-01T00:00:00.000Z',
};

describe('applyAgentChatThreadLiveFields', () => {
  it('keeps only the fields changed live after the load started', () => {
    expect(
      applyAgentChatThreadLiveFields({
        loadedThread: THREAD,
        storedThread: {
          ...THREAD,
          title: 'Renamed live',
          lastMessageText: 'Stored message',
          assigneeId: 'member',
        },
        fieldUpdateCounts: { title: 3, lastMessageText: 1, assigneeId: 2 },
        updateCountBeforeLoad: 2,
      }),
    ).toEqual({ ...THREAD, title: 'Renamed live' });
  });
});
