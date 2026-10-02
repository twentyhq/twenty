import { formatUsageLimitDuration } from '@/settings/billing/utils/formatUsageLimitDuration';

describe('formatUsageLimitDuration', () => {
  it('keeps a sub-second duration in milliseconds', () => {
    expect(formatUsageLimitDuration(0)).toBe('0 ms');
    expect(formatUsageLimitDuration(500)).toBe('500 ms');
  });

  it('shows seconds under a minute', () => {
    expect(formatUsageLimitDuration(1_000)).toBe('1 s');
    expect(formatUsageLimitDuration(15_400)).toBe('15.4 s');
  });

  it('shows minutes under an hour', () => {
    expect(formatUsageLimitDuration(60_000)).toBe('1 min');
    expect(formatUsageLimitDuration(90_000)).toBe('1.5 min');
  });

  it('shows hours from an hour on', () => {
    expect(formatUsageLimitDuration(3_600_000)).toBe('1 h');
    expect(formatUsageLimitDuration(9_000_000)).toBe('2.5 h');
  });
});
