import { getStripeObjectId } from 'src/engine/core-modules/billing/utils/get-stripe-object-id.util';

describe('getStripeObjectId', () => {
  it('returns the same string when input is a string id', () => {
    expect(getStripeObjectId('price_123')).toBe('price_123');
  });

  it('returns the id field when input is an object with id', () => {
    expect(getStripeObjectId({ id: 'price_abc' })).toBe('price_abc');
  });
});
