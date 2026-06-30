import { useListProducts } from '@/settings/billing/hooks/useListProducts';

describe('useListProducts', () => {
  it('should be a function', () => {
    expect(typeof useListProducts).toBe('function');
  });
});
