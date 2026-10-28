import { type AgentChatThreadRecord } from '@/ai/types/AgentChatThreadRecord';
import { groupThreadsByDate } from '@/ai/utils/groupThreadsByDate';

describe('groupThreadsByDate', () => {
  const today = new Date('2026-04-26T12:00:00');

  const getDateDaysAgo = (daysAgo: number) => {
    const date = new Date(today);
    date.setDate(today.getDate() - daysAgo);

    return date;
  };

  const yesterday = getDateDaysAgo(1);
  const twoDaysAgo = getDateDaysAgo(2);
  const sevenDaysAgo = getDateDaysAgo(7);
  const eightDaysAgo = getDateDaysAgo(8);
  const fourteenDaysAgo = getDateDaysAgo(14);

  const buildThread = ({
    id,
    updatedAt,
  }: {
    id: string;
    updatedAt: Date;
  }): AgentChatThreadRecord => ({
    __typename: 'AgentChatThread',
    id,
    title: 'Test Thread',
    createdAt: twoDaysAgo.toISOString(),
    deletedAt: null,
    updatedAt: updatedAt.toISOString(),
  });

  it('groups threads into Today, Yesterday, Previous 7 days, and month sections', () => {
    const monthFormatter = new Intl.DateTimeFormat(undefined, {
      month: 'long',
      year: 'numeric',
    });

    const threads: AgentChatThreadRecord[] = [
      buildThread({ id: '1', updatedAt: today }),
      buildThread({ id: '2', updatedAt: yesterday }),
      buildThread({ id: '3', updatedAt: twoDaysAgo }),
      buildThread({ id: '4', updatedAt: sevenDaysAgo }),
      buildThread({ id: '5', updatedAt: eightDaysAgo }),
      buildThread({ id: '6', updatedAt: fourteenDaysAgo }),
    ];

    const result = groupThreadsByDate({ threads, today });

    expect(result).toHaveLength(4);
    expect(result[0]).toMatchObject({
      id: 'today',
      title: 'Today',
      threads: [{ id: '1' }],
    });
    expect(result[1]).toMatchObject({
      id: 'yesterday',
      title: 'Yesterday',
      threads: [{ id: '2' }],
    });
    expect(result[2]).toMatchObject({
      id: 'previous-7-days',
      title: 'Previous 7 days',
      threads: [{ id: '3' }, { id: '4' }],
    });
    expect(result[3]).toMatchObject({
      id: 'month:2026-4',
      title: monthFormatter.format(eightDaysAgo),
      threads: [{ id: '5' }, { id: '6' }],
    });
  });

  it('returns no groups if no threads', () => {
    expect(groupThreadsByDate({ threads: [], today })).toEqual([]);
    expect(
      groupThreadsByDate({ threads: [], today, variant: 'compact' }),
    ).toEqual([]);
  });

  it('groups a thread by its last update', () => {
    const [group] = groupThreadsByDate({
      threads: [buildThread({ id: '1', updatedAt: yesterday })],
      today,
    });

    expect(group.id).toBe('yesterday');
  });

  describe('compact groups', () => {
    const compactToday = new Date('2026-10-28T12:00:00Z');

    it('uses the current calendar week and keeps group order for compact lists', () => {
      const threads = [
        buildThread({
          id: 'sunday',
          updatedAt: new Date('2026-10-25T10:00:00Z'),
        }),
        buildThread({
          id: 'yesterday',
          updatedAt: new Date('2026-10-27T10:00:00Z'),
        }),
        buildThread({
          id: 'today',
          updatedAt: new Date('2026-10-28T10:00:00Z'),
        }),
        buildThread({
          id: 'september',
          updatedAt: new Date('2026-09-12T10:00:00Z'),
        }),
        buildThread({
          id: 'monday',
          updatedAt: new Date('2026-10-26T10:00:00Z'),
        }),
      ];

      const groups = groupThreadsByDate({
        threads,
        today: compactToday,
        variant: 'compact',
      });

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

    it('omits empty compact groups and keeps future activity in Today', () => {
      const groups = groupThreadsByDate({
        threads: [
          buildThread({
            id: 'future',
            updatedAt: new Date('2026-10-29T10:00:00Z'),
          }),
          buildThread({
            id: 'earlier',
            updatedAt: new Date('2026-09-12T10:00:00Z'),
          }),
        ],
        today: compactToday,
        variant: 'compact',
      });

      expect(groups.map(({ id }) => id)).toEqual(['today', 'earlier']);
    });
  });

  describe('timezone handling', () => {
    it('keeps a thread last touched a few hours ago in Today across DST/midnight boundaries', () => {
      const todayLate = new Date('2026-04-26T23:30:00');
      const todayEarly = new Date('2026-04-26T00:15:00');

      const result = groupThreadsByDate({
        threads: [
          buildThread({ id: 'late', updatedAt: todayLate }),
          buildThread({ id: 'early', updatedAt: todayEarly }),
        ],
        today,
      });

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        id: 'today',
        threads: [{ id: 'late' }, { id: 'early' }],
      });
    });

    it('places a thread last touched late yesterday in the Yesterday bucket', () => {
      const yesterdayJustBeforeMidnight = new Date('2026-04-25T23:59:00');

      const [group] = groupThreadsByDate({
        threads: [
          buildThread({ id: 'y', updatedAt: yesterdayJustBeforeMidnight }),
        ],
        today,
      });

      expect(group.id).toBe('yesterday');
    });

    it('does not slip a thread from yesterday into Today when local times differ by hours', () => {
      const yesterdayMorning = new Date('2026-04-25T08:00:00');

      const [group] = groupThreadsByDate({
        threads: [buildThread({ id: 'y', updatedAt: yesterdayMorning })],
        today,
      });

      expect(group.id).toBe('yesterday');
    });
  });
});
