import { isSellableBillingProduct } from '@/settings/billing/utils/isSellableBillingProduct';

describe('isSellableBillingProduct', () => {
  it('treats an unmarked product as sellable', () => {
    expect(isSellableBillingProduct({ metadata: {} })).toBe(true);
  });

  it('treats a superseded product as not sellable', () => {
    expect(isSellableBillingProduct({ metadata: { isLegacy: 'true' } })).toBe(
      false,
    );
  });
});
