import { useCurrentMetered } from '@/settings/billing/hooks/useCurrentMetered';

describe('useCurrentMetered', () => {
  it('should be a function', () => {
    expect(typeof useCurrentMetered).toBe('function');
  });
});
