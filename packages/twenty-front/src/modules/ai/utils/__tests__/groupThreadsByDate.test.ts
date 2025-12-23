import { type AgentChatThread } from '~/generated-metadata/graphql';
import { groupThreadsByDate } from '@/ai/utils/groupThreadsByDate';

describe('groupThreadsByDate', () => {
  const baseThread: Omit<AgentChatThread, 'createdAt' | 'id'> = {
    title: 'Test Thread',
    updatedAt: new Date().toISOString(),
    totalInputTokens: 0,
    totalOutputTokens: 0,
    contextWindowTokens: null,
    totalInputCredits: 0,
    totalOutputCredits: 0,
  };

  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const twoDaysAgo = new Date(today);
  twoDaysAgo.setDate(today.getDate() - 2);

  const threads: AgentChatThread[] = [
    { ...baseThread, id: '1', createdAt: today.toISOString() },
    { ...baseThread, id: '2', createdAt: yesterday.toISOString() },
    { ...baseThread, id: '3', createdAt: twoDaysAgo.toISOString() },
  ];

  it('groups threads into today, yesterday, and older', () => {
    const result = groupThreadsByDate(threads);
    expect(result.today).toHaveLength(1);
    expect(result.today[0].id).toBe('1');
    expect(result.yesterday).toHaveLength(1);
    expect(result.yesterday[0].id).toBe('2');
    expect(result.older).toHaveLength(1);
    expect(result.older[0].id).toBe('3');
  });

  it('returns empty arrays if no threads', () => {
    const result = groupThreadsByDate([]);
    expect(result.today).toEqual([]);
    expect(result.yesterday).toEqual([]);
    expect(result.older).toEqual([]);
  });
});
