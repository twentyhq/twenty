import { isSellableBillingPrice } from '@/settings/billing/utils/isSellableBillingPrice';

describe('isSellableBillingPrice', () => {
  it('treats a sellable price as sellable', () => {
    expect(isSellableBillingPrice({ isSellable: true })).toBe(true);
  });

  it('treats a superseded or archived price as not sellable', () => {
    expect(isSellableBillingPrice({ isSellable: false })).toBe(false);
  });

  it('does not assume sellability when the flag is missing', () => {
    expect(isSellableBillingPrice({})).toBe(false);
  });
});
