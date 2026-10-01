import { formatAgentChatThreadActivityTime } from '@/ai/utils/formatAgentChatThreadActivityTime';

describe('formatAgentChatThreadActivityTime', () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date(2026, 9, 1, 12, 0));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('shows recent activity relative to now', () => {
    expect(
      formatAgentChatThreadActivityTime(
        new Date(2026, 9, 1, 10, 0).toISOString(),
      ),
    ).toBe('2h');
    expect(
      formatAgentChatThreadActivityTime(
        new Date(2026, 8, 28, 12, 0).toISOString(),
      ),
    ).toBe('3d');
  });

  it('shows older activity as its date', () => {
    expect(
      formatAgentChatThreadActivityTime(
        new Date(2026, 8, 12, 12, 0).toISOString(),
      ),
    ).toBe('Sep 12');
  });

  it('shows nothing for an invalid date', () => {
    expect(formatAgentChatThreadActivityTime('not a date')).toBe('');
  });
});
