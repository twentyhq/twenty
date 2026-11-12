import { type AgentChatThreadRecord } from '@/ai/types/AgentChatThreadRecord';
import { filterAgentChatThreadsWithinLoadedPages } from '@/ai/utils/filterAgentChatThreadsWithinLoadedPages';

const buildThread = ({
  id,
  lastActivityAt,
}: {
  id: string;
  lastActivityAt: string | null;
}): AgentChatThreadRecord => ({
  __typename: 'AgentChatThread',
  id,
  title: id,
  deletedAt: null,
  createdAt: '2026-11-01T00:00:00.000Z',
  updatedAt: '2026-11-10T00:00:00.000Z',
  lastActivityAt,
});

const THREADS = [
  buildThread({ id: 'newer', lastActivityAt: '2026-10-10T00:00:00.000Z' }),
  buildThread({ id: 'older', lastActivityAt: '2026-10-01T00:00:00.000Z' }),
  buildThread({
    id: 'loaded-older',
    lastActivityAt: '2026-09-01T00:00:00.000Z',
  }),
  buildThread({ id: 'no-activity', lastActivityAt: null }),
  buildThread({ id: 'loaded-no-activity', lastActivityAt: null }),
];

const getIds = (threads: AgentChatThreadRecord[]) =>
  threads.map(({ id }) => id);

describe('filterAgentChatThreadsWithinLoadedPages', () => {
  it('keeps every chat once all pages are loaded', () => {
    expect(
      getIds(
        filterAgentChatThreadsWithinLoadedPages({
          threads: THREADS,
          pagedList: {
            threadIds: [],
            hasNextPage: false,
            lastLoadedActivityAt: '2026-10-05T00:00:00.000Z',
          },
        }),
      ),
    ).toEqual(getIds(THREADS));
  });

  it('hides chats past the last loaded page, but never a loaded one', () => {
    expect(
      getIds(
        filterAgentChatThreadsWithinLoadedPages({
          threads: THREADS,
          pagedList: {
            threadIds: ['loaded-older', 'loaded-no-activity'],
            hasNextPage: true,
            lastLoadedActivityAt: '2026-10-05T00:00:00.000Z',
          },
        }),
      ),
    ).toEqual(['newer', 'loaded-older', 'loaded-no-activity']);
  });

  it('keeps chats with activity once the pages reach chats without any', () => {
    expect(
      getIds(
        filterAgentChatThreadsWithinLoadedPages({
          threads: THREADS,
          pagedList: {
            threadIds: ['loaded-no-activity'],
            hasNextPage: true,
            lastLoadedActivityAt: null,
          },
        }),
      ),
    ).toEqual(['newer', 'older', 'loaded-older', 'loaded-no-activity']);
  });
});
