import { useNextBillingPhase } from '@/billing/hooks/useNextBillingPhase';

describe('useNextBillingPhase', () => {
  it('should be a function', () => {
    expect(typeof useNextBillingPhase).toBe('function');
  });
});
