import { type AiChatUsage } from '@/ai/types/AiChatUsage';
import { isAiChatUsageLimitReached } from '@/ai/utils/isAiChatUsageLimitReached';

const buildUsage = (overrides: Partial<AiChatUsage> = {}): AiChatUsage => ({
  limitValue: 1000,
  consumedValue: 100,
  periodEnd: '2026-10-01T00:00:00.000Z',
  kind: 'limit',
  ...overrides,
});

describe('isAiChatUsageLimitReached', () => {
  it('reports a limit consumed up to its value', () => {
    expect(isAiChatUsageLimitReached(buildUsage({ consumedValue: 1000 }))).toBe(
      true,
    );
  });

  it('reports a limit blocking every send', () => {
    expect(
      isAiChatUsageLimitReached(
        buildUsage({ limitValue: 0, consumedValue: 0 }),
      ),
    ).toBe(true);
  });

  it('ignores a limit with room left', () => {
    expect(isAiChatUsageLimitReached(buildUsage())).toBe(false);
  });

  it('ignores an unreadable counter', () => {
    expect(isAiChatUsageLimitReached(buildUsage({ consumedValue: null }))).toBe(
      false,
    );
  });

  it('ignores the plan allowance, which the credits banner owns', () => {
    expect(
      isAiChatUsageLimitReached(
        buildUsage({ consumedValue: 1000, kind: 'allowance' }),
      ),
    ).toBe(false);
  });

  it('ignores a workspace with no usage at all', () => {
    expect(isAiChatUsageLimitReached(null)).toBe(false);
  });
});
