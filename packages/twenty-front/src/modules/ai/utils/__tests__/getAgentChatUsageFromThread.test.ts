import { accumulateAgentChatUsage } from '@/ai/utils/accumulateAgentChatUsage';
import { formatAiChatTokens } from '@/ai/utils/formatAiChatTokens';
import { getAgentChatUsageFromThread } from '@/ai/utils/getAgentChatUsageFromThread';

const storedThread = {
  conversationSize: 120,
  contextWindowTokens: 1000,
  totalInputTokens: 250,
  totalOutputTokens: 30,
  totalCacheReadTokens: 80,
  totalInputCredits: '125000',
  totalOutputCredits: 50000,
};

describe('getAgentChatUsageFromThread', () => {
  it('restores cumulative usage in display credits without the last message', () => {
    expect(getAgentChatUsageFromThread(storedThread)).toEqual({
      conversationSize: 120,
      contextWindowTokens: 1000,
      inputTokens: 250,
      outputTokens: 30,
      cachedInputTokens: 80,
      inputCredits: 0.125,
      outputCredits: 0.05,
      lastMessage: null,
    });
  });

  it('restores a cached input total that live record events send as a string', () => {
    expect(
      getAgentChatUsageFromThread({
        ...storedThread,
        totalCacheReadTokens: '1158169',
      })?.cachedInputTokens,
    ).toBe(1158169);
  });

  it('adds later messages to a restored string total instead of appending them', () => {
    const restoredUsage = getAgentChatUsageFromThread({
      ...storedThread,
      totalCacheReadTokens: '1158169',
    });

    const usageAfterMessages = [187212, 206570, 221278].reduce(
      (usage, cachedInputTokens) =>
        accumulateAgentChatUsage(
          usage,
          {
            inputTokens: 0,
            outputTokens: 0,
            cachedInputTokens,
            inputCredits: 0,
            outputCredits: 0,
            conversationSize: 120,
          },
          { contextWindowTokens: 1000 },
        ),
      restoredUsage,
    );

    expect(usageAfterMessages?.cachedInputTokens).toBe(1773229);
    expect(formatAiChatTokens(usageAfterMessages?.cachedInputTokens ?? 0)).toBe(
      '1.8M',
    );
  });

  it('does not show a breakdown for an unused thread', () => {
    expect(
      getAgentChatUsageFromThread({ ...storedThread, conversationSize: 0 }),
    ).toBeNull();
  });
});
