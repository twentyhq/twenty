import { useBaseProductByPlanKey } from '@/billing/hooks/useBaseProductByPlanKey';

describe('useBaseProductByPlanKey', () => {
  it('should be a function', () => {
    expect(typeof useBaseProductByPlanKey).toBe('function');
  });
});
