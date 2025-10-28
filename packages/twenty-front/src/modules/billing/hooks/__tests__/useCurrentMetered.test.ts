import { useCurrentMetered } from '@/billing/hooks/useCurrentMetered';

describe('useCurrentMetered', () => {
  it('should be a function', () => {
    expect(typeof useCurrentMetered).toBe('function');
  });
});
