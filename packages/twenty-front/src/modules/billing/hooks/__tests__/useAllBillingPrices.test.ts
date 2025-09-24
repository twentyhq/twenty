import { useAllBillingPrices } from '@/billing/hooks/useAllBillingPrices';

describe('useAllBillingPrices', () => {
  it('should be a function', () => {
    expect(typeof useAllBillingPrices).toBe('function');
  });
});
