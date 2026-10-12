import { hasUsageLimitValue } from '@/settings/billing/utils/hasUsageLimitValue';

describe('hasUsageLimitValue', () => {
  it('counts zero as an entered amount', () => {
    expect(hasUsageLimitValue({ limitValue: '0' })).toBe(true);
  });

  it('ignores a blank amount', () => {
    expect(hasUsageLimitValue({ limitValue: '' })).toBe(false);
    expect(hasUsageLimitValue({ limitValue: '  ' })).toBe(false);
  });
});
