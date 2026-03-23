import { useBaseProductByPlanKey } from '@/settings/billing/hooks/useBaseProductByPlanKey';

describe('useBaseProductByPlanKey', () => {
  it('should be a function', () => {
    expect(typeof useBaseProductByPlanKey).toBe('function');
  });
});
