import { useCurrentBillingFlags } from '@/settings/billing/hooks/useCurrentBillingFlags';

describe('useCurrentBillingFlags', () => {
  it('should be a function', () => {
    expect(typeof useCurrentBillingFlags).toBe('function');
  });
});
