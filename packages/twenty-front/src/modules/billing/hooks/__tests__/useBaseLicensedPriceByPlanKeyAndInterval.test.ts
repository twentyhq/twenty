import { useBaseLicensedPriceByPlanKeyAndInterval } from '@/billing/hooks/useBaseLicensedPriceByPlanKeyAndInterval';

describe('useBaseLicensedPriceByPlanKeyAndInterval', () => {
  it('should be a function', () => {
    expect(typeof useBaseLicensedPriceByPlanKeyAndInterval).toBe('function');
  });
});
