import { type AgentChatThreadRecord } from '@/ai/types/AgentChatThreadRecord';
import { groupThreadsBySnoozeTime } from '@/ai/utils/groupThreadsBySnoozeTime';

const buildThread = (id: string): AgentChatThreadRecord => ({
  __typename: 'AgentChatThread',
  id,
  title: id,
  createdAt: '2026-11-01T09:00:00.000Z',
  updatedAt: '2026-11-03T11:00:00.000Z',
  lastActivityAt: '2026-11-03T11:00:00.000Z',
  deletedAt: null,
});

describe('groupThreadsBySnoozeTime', () => {
  it('orders snoozed chats by their wake date instead of their activity', () => {
    const snoozedUntilByThreadId = {
      december: '2026-12-01T09:00:00.000Z',
      monday: '2026-11-09T09:00:00.000Z',
      friday: '2026-11-06T09:00:00.000Z',
      afternoon: '2026-11-04T15:00:00.000Z',
      morning: '2026-11-04T09:00:00.000Z',
      today: '2026-11-03T18:00:00.000Z',
    };
    const threads = Object.keys(snoozedUntilByThreadId).map(buildThread);
    const groups = groupThreadsBySnoozeTime({
      threads,
      snoozedUntilByThreadId,
      timeZone: 'UTC',
      today: new Date('2026-11-03T12:00:00.000Z'),
    });

    expect(
      groups.map(({ id, threads: groupedThreads }) => ({
        id,
        threadIds: groupedThreads.map((thread) => thread.id),
      })),
    ).toEqual([
      { id: 'later-today', threadIds: ['today'] },
      { id: 'tomorrow', threadIds: ['morning', 'afternoon'] },
      { id: 'this-week', threadIds: ['friday'] },
      { id: 'next-week', threadIds: ['monday'] },
      { id: 'month:2026-12', threadIds: ['december'] },
    ]);
    expect(threads.map((thread) => thread.id)).toEqual(
      Object.keys(snoozedUntilByThreadId),
    );
  });

  it('keeps equal wake deadlines in descending thread ID order', () => {
    const groups = groupThreadsBySnoozeTime({
      threads: [buildThread('alpha'), buildThread('omega')],
      snoozedUntilByThreadId: {
        alpha: '2026-11-04T09:00:00.000Z',
        omega: '2026-11-04T09:00:00.000Z',
      },
      timeZone: 'UTC',
      today: new Date('2026-11-03T12:00:00.000Z'),
    });

    expect(groups[0].threads.map(({ id }) => id)).toEqual(['omega', 'alpha']);
  });

  it('uses the member timezone for the today and tomorrow boundary', () => {
    const groups = groupThreadsBySnoozeTime({
      threads: [buildThread('tomorrow'), buildThread('today')],
      snoozedUntilByThreadId: {
        today: '2026-11-04T03:00:00.000Z',
        tomorrow: '2026-11-04T09:00:00.000Z',
      },
      timeZone: 'America/Los_Angeles',
      today: new Date('2026-11-04T00:30:00.000Z'),
    });

    expect(
      groups.map(({ id, threads }) => ({
        id,
        threadIds: threads.map((thread) => thread.id),
      })),
    ).toEqual([
      { id: 'later-today', threadIds: ['today'] },
      { id: 'tomorrow', threadIds: ['tomorrow'] },
    ]);
  });
});
