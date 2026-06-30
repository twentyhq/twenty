import { usePriceAndBillingUsageByPriceId } from '@/settings/billing/hooks/usePriceAndBillingUsageByPriceId';

describe('usePriceAndBillingUsageByPriceId', () => {
  it('should be a function', () => {
    expect(typeof usePriceAndBillingUsageByPriceId).toBe('function');
  });
});
