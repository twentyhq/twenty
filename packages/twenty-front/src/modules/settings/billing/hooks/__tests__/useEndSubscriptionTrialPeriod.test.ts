import { useEndSubscriptionTrialPeriod } from '@/settings/billing/hooks/useEndSubscriptionTrialPeriod';

describe('useEndSubscriptionTrialPeriod', () => {
  it('should be a function', () => {
    expect(typeof useEndSubscriptionTrialPeriod).toBe('function');
  });
});
