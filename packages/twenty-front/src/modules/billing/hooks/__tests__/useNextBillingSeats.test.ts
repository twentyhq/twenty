import { useNextBillingSeats } from '@/billing/hooks/useNextBillingSeats';

describe('useNextBillingSeats', () => {
  it('should be a function', () => {
    expect(typeof useNextBillingSeats).toBe('function');
  });
});
