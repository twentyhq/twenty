import { useFormatPrices } from '@/billing/hooks/useFormatPrices';

describe('useFormatPrices', () => {
  it('should be a function', () => {
    expect(typeof useFormatPrices).toBe('function');
  });
});
