import { useHandleCheckoutSession } from '@/billing/hooks/useHandleCheckoutSession';

describe('useHandleCheckoutSession', () => {
  it('should be a function', () => {
    expect(typeof useHandleCheckoutSession).toBe('function');
  });
});
