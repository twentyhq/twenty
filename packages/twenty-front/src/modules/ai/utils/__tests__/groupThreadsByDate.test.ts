import { type AgentChatThread } from '~/generated-metadata/graphql';
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

  const baseThread: Omit<AgentChatThread, 'updatedAt' | 'id'> = {
    title: 'Test Thread',
    createdAt: twoDaysAgo.toISOString(),
    totalInputTokens: 0,
    totalOutputTokens: 0,
    contextWindowTokens: null,
    conversationSize: 0,
    totalInputCredits: 0,
    totalOutputCredits: 0,
  };

  const threads: AgentChatThread[] = [
    { ...baseThread, id: '1', updatedAt: today.toISOString() },
    { ...baseThread, id: '2', updatedAt: yesterday.toISOString() },
    { ...baseThread, id: '3', updatedAt: twoDaysAgo.toISOString() },
    { ...baseThread, id: '4', updatedAt: sevenDaysAgo.toISOString() },
    { ...baseThread, id: '5', updatedAt: eightDaysAgo.toISOString() },
    { ...baseThread, id: '6', updatedAt: fourteenDaysAgo.toISOString() },
  ];

  it('groups threads into relative, exact date, and month sections', () => {
    const exactDateFormatter = new Intl.DateTimeFormat(undefined, {
      day: 'numeric',
      month: 'short',
    });
    const monthFormatter = new Intl.DateTimeFormat(undefined, {
      month: 'long',
      year: 'numeric',
    });

    const result = groupThreadsByDate(threads, today);

    expect(result).toHaveLength(5);
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
      id: 'date:2026-4-24',
      title: exactDateFormatter.format(twoDaysAgo),
      threads: [{ id: '3' }],
    });
    expect(result[3]).toMatchObject({
      id: 'date:2026-4-19',
      title: exactDateFormatter.format(sevenDaysAgo),
      threads: [{ id: '4' }],
    });
    expect(result[4]).toMatchObject({
      id: 'month:2026-4',
      title: monthFormatter.format(eightDaysAgo),
      threads: [{ id: '5' }, { id: '6' }],
    });
  });

  it('returns no groups if no threads', () => {
    const result = groupThreadsByDate([], today);

    expect(result).toEqual([]);
  });
});
