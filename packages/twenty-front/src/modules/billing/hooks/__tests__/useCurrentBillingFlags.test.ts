import { useCurrentBillingFlags } from '@/billing/hooks/useCurrentBillingFlags';

describe('useCurrentBillingFlags', () => {
  it('should be a function', () => {
    expect(typeof useCurrentBillingFlags).toBe('function');
  });
});
