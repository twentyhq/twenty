import { getAgentChatUsageFromThread } from '@/ai/utils/getAgentChatUsageFromThread';

const storedThread = {
  conversationSize: 120,
  contextWindowTokens: 1000,
  totalInputTokens: 250,
  totalOutputTokens: 30,
  totalCacheReadTokens: 80,
  totalInputCredits: 0.125,
  totalOutputCredits: 0.05,
  lastMessageUsage: {
    inputTokens: 120,
    outputTokens: 20,
    cachedInputTokens: 50,
    inputCredits: 0.075,
    outputCredits: 0.03,
  },
};

describe('getAgentChatUsageFromThread', () => {
  it('restores last message and cumulative cache usage without counting it twice', () => {
    expect(getAgentChatUsageFromThread(storedThread)).toEqual({
      conversationSize: 120,
      contextWindowTokens: 1000,
      inputTokens: 250,
      outputTokens: 30,
      cachedInputTokens: 80,
      inputCredits: 0.125,
      outputCredits: 0.05,
      lastMessage: storedThread.lastMessageUsage,
    });
  });

  it('does not invent last-message usage for an older conversation', () => {
    expect(
      getAgentChatUsageFromThread({ ...storedThread, lastMessageUsage: null }),
    ).toMatchObject({ lastMessage: null, cachedInputTokens: 80 });
  });

  it('does not show a breakdown for an unused thread', () => {
    expect(
      getAgentChatUsageFromThread({ ...storedThread, conversationSize: 0 }),
    ).toBeNull();
  });
});
