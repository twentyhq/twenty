import { usePlanByPlanKey } from '@/settings/billing/hooks/usePlanByPlanKey';

describe('usePlanByPlanKey', () => {
  it('should be a function', () => {
    expect(typeof usePlanByPlanKey).toBe('function');
  });
});
