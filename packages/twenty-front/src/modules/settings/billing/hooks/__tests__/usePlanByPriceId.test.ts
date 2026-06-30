import { usePlanByPriceId } from '@/settings/billing/hooks/usePlanByPriceId';

describe('usePlanByPriceId', () => {
  it('should be a function', () => {
    expect(typeof usePlanByPriceId).toBe('function');
  });
});
