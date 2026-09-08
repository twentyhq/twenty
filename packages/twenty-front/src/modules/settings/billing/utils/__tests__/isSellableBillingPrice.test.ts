import { isSellableBillingPrice } from '@/settings/billing/utils/isSellableBillingPrice';

describe('isSellableBillingPrice', () => {
  it('treats a sellable price as sellable', () => {
    expect(isSellableBillingPrice({})).toBe(true);
    expect(isSellableBillingPrice({ isSellable: true })).toBe(true);
  });

  it('treats a superseded or archived price as not sellable', () => {
    expect(isSellableBillingPrice({ isSellable: false })).toBe(false);
  });
});
