import { type AgentChatThreadRecord } from '@/ai/types/AgentChatThreadRecord';
import { groupRecordChatThreadsByDate } from '@/page-layout/widgets/chat-threads/utils/groupRecordChatThreadsByDate';

const TODAY = new Date('2026-10-28T12:00:00Z');

const buildThread = ({
  id,
  activityAt,
}: {
  id: string;
  activityAt: string;
}): AgentChatThreadRecord => ({
  __typename: 'AgentChatThread',
  id,
  title: id,
  deletedAt: null,
  createdAt: activityAt,
  updatedAt: activityAt,
  lastActivityAt: activityAt,
});

describe('groupRecordChatThreadsByDate', () => {
  it('groups conversations by the current calendar week and preserves their order', () => {
    const threads = [
      buildThread({ id: 'today', activityAt: '2026-10-28T10:00:00Z' }),
      buildThread({ id: 'yesterday', activityAt: '2026-10-27T10:00:00Z' }),
      buildThread({ id: 'monday', activityAt: '2026-10-26T10:00:00Z' }),
      buildThread({ id: 'sunday', activityAt: '2026-10-25T10:00:00Z' }),
      buildThread({ id: 'september', activityAt: '2026-09-12T10:00:00Z' }),
    ];

    const groups = groupRecordChatThreadsByDate({ threads, today: TODAY });

    expect(
      groups.map(({ id, threads: groupedThreads }) => ({
        id,
        threadIds: groupedThreads.map(({ id: threadId }) => threadId),
      })),
    ).toEqual([
      { id: 'today', threadIds: ['today'] },
      { id: 'this-week', threadIds: ['yesterday', 'monday'] },
      { id: 'earlier', threadIds: ['sunday', 'september'] },
    ]);
  });

  it('omits empty groups', () => {
    expect(groupRecordChatThreadsByDate({ threads: [], today: TODAY })).toEqual(
      [],
    );

    const groups = groupRecordChatThreadsByDate({
      threads: [
        buildThread({ id: 'earlier', activityAt: '2026-09-12T10:00:00Z' }),
      ],
      today: TODAY,
    });

    expect(groups.map(({ id }) => id)).toEqual(['earlier']);
  });
});
