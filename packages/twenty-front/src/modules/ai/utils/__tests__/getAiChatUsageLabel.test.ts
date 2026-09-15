import { setupI18n } from '@lingui/core';
import { getAiChatUsageLabel } from '@/ai/utils/getAiChatUsageLabel';

const i18n = setupI18n({ locale: 'en', messages: { en: {} } });
const base = {
  i18n,
  loading: false,
  hasError: false,
  hasUsage: true,
  daysUntilReset: null,
  creditPercentage: 80,
};

describe('getAiChatUsageLabel', () => {
  it.each([
    [1, 'Reset in 1 day (80%)'],
    [2, 'Reset in 2 days (80%)'],
    [0, 'Reset in 0 days (80%)'],
  ])('pluralizes %s days', (daysUntilReset, expected) => {
    expect(
      getAiChatUsageLabel({
        ...base,
        daysUntilReset: daysUntilReset as number,
      }),
    ).toBe(expected);
  });
  it('distinguishes unavailable consumption from no limit and zero usage', () => {
    expect(getAiChatUsageLabel({ ...base, creditPercentage: null })).toBe('—');
    expect(getAiChatUsageLabel({ ...base, hasUsage: false })).toBe('No limit');
    expect(
      getAiChatUsageLabel({ ...base, creditPercentage: 0 }),
    ).toBeUndefined();
  });
  it('prioritizes loading and errors over stale data', () => {
    expect(getAiChatUsageLabel({ ...base, loading: true })).toBe('Loading…');
    expect(getAiChatUsageLabel({ ...base, hasError: true })).toBe(
      'Not available',
    );
  });
});
