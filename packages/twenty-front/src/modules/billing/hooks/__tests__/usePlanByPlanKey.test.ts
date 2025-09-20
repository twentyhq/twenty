import { usePlanByPlanKey } from '@/billing/hooks/usePlanByPlanKey';

describe('usePlanByPlanKey', () => {
  it('should be a function', () => {
    expect(typeof usePlanByPlanKey).toBe('function');
  });
});
