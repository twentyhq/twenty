import { useListProducts } from '@/billing/hooks/useListProducts';

describe('useListProducts', () => {
  it('should be a function', () => {
    expect(typeof useListProducts).toBe('function');
  });
});
