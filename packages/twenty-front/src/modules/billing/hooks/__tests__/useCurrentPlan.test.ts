import { useCurrentPlan } from '@/billing/hooks/useCurrentPlan';

describe('useCurrentPlan', () => {
  it('should be a function', () => {
    expect(typeof useCurrentPlan).toBe('function');
  });
});
