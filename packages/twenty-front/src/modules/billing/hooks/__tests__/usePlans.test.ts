import { usePlans } from '@/billing/hooks/usePlans';

describe('usePlans', () => {
  it('should be a function', () => {
    expect(typeof usePlans).toBe('function');
  });
});
