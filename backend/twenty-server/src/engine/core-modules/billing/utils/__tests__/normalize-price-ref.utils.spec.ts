import { normalizePriceRef } from 'src/engine/core-modules/billing/utils/normalize-price-ref.utils';

describe('normalizePriceRef', () => {
  it('returns the same string when input is a string id', () => {
    expect(normalizePriceRef('price_123')).toBe('price_123');
  });

  it('returns the id field when input is an object with id', () => {
    expect(normalizePriceRef({ id: 'price_abc' })).toBe('price_abc');
  });
});
