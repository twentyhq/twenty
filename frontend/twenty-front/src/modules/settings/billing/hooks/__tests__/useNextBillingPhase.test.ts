import { useNextBillingPhase } from '@/settings/billing/hooks/useNextBillingPhase';

describe('useNextBillingPhase', () => {
  it('should be a function', () => {
    expect(typeof useNextBillingPhase).toBe('function');
  });
});
