import { useNextPlan } from '@/settings/billing/hooks/useNextPlan';

describe('useNextPlan', () => {
  it('should be a function', () => {
    expect(typeof useNextPlan).toBe('function');
  });
});
