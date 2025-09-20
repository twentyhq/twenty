import { useHasNextBillingPhase } from '@/billing/hooks/useHasNextBillingPhase';

describe('useHasNextBillingPhase', () => {
  it('should be a function', () => {
    expect(typeof useHasNextBillingPhase).toBe('function');
  });
});
