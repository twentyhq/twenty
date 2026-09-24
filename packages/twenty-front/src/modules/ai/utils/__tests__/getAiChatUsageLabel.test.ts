import { getAiChatUsageLabel } from '@/ai/utils/getAiChatUsageLabel';

const base = {
  loading: false,
  hasError: false,
  hasUsage: true,
  daysUntilReset: null as number | null,
  creditPercentage: 80 as number | null,
};

describe('getAiChatUsageLabel', () => {
  it.each<[number, string]>([
    [1, 'Reset in 1 day (80%)'],
    [2, 'Reset in 2 days (80%)'],
    [0, 'Reset in 0 days (80%)'],
  ])('pluralizes %s days', (daysUntilReset, expected) => {
    expect(getAiChatUsageLabel({ ...base, daysUntilReset })).toBe(expected);
  });

  it('shows the bare percentage when no reset date applies', () => {
    expect(getAiChatUsageLabel(base)).toBe('80%');
  });

  it('distinguishes unavailable consumption from no limit', () => {
    expect(getAiChatUsageLabel({ ...base, creditPercentage: null })).toBe('—');
    expect(getAiChatUsageLabel({ ...base, hasUsage: false })).toBe('No limit');
  });

  it('prioritizes loading and errors over stale data', () => {
    expect(getAiChatUsageLabel({ ...base, loading: true })).toBe('Loading…');
    expect(getAiChatUsageLabel({ ...base, hasError: true })).toBe(
      'Not available',
    );
  });
});
