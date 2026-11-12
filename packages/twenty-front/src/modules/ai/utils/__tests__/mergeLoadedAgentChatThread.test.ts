import { type AgentChatThreadRecord } from '@/ai/types/AgentChatThreadRecord';
import { mergeLoadedAgentChatThread } from '@/ai/utils/mergeLoadedAgentChatThread';

const LOADED_THREAD: AgentChatThreadRecord = {
  __typename: 'AgentChatThread',
  id: 'thread',
  title: 'Loaded title',
  lastMessageText: 'Loaded message',
  deletedAt: null,
  createdAt: '2026-11-01T00:00:00.000Z',
  updatedAt: '2026-11-02T00:00:00.000Z',
};

describe('mergeLoadedAgentChatThread', () => {
  it('takes the loaded chat when nothing newer is stored', () => {
    expect(
      mergeLoadedAgentChatThread({
        loadedThread: LOADED_THREAD,
        storedThread: {
          ...LOADED_THREAD,
          title: 'Older title',
          updatedAt: '2026-11-01T00:00:00.000Z',
        },
      }),
    ).toEqual(LOADED_THREAD);
    expect(
      mergeLoadedAgentChatThread({
        loadedThread: LOADED_THREAD,
        storedThread: null,
      }),
    ).toEqual(LOADED_THREAD);
  });

  it('keeps a local change made on the same version of the chat', () => {
    expect(
      mergeLoadedAgentChatThread({
        loadedThread: LOADED_THREAD,
        storedThread: { ...LOADED_THREAD, title: 'Renamed locally' },
      }),
    ).toEqual({ ...LOADED_THREAD, title: 'Renamed locally' });
  });

  it('keeps what a more recent update stored, and fills the rest', () => {
    expect(
      mergeLoadedAgentChatThread({
        loadedThread: LOADED_THREAD,
        storedThread: {
          id: 'thread',
          title: 'Renamed since',
          updatedAt: '2026-11-03T00:00:00.000Z',
        },
      }),
    ).toEqual({
      ...LOADED_THREAD,
      title: 'Renamed since',
      updatedAt: '2026-11-03T00:00:00.000Z',
    });
  });
});
