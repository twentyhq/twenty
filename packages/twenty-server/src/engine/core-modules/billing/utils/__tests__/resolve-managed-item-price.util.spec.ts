/* @license Enterprise */

import { BillingProductKey } from 'src/engine/core-modules/billing/enums/billing-product-key.enum';
import { resolveManagedItemPrice } from 'src/engine/core-modules/billing/utils/resolve-managed-item-price.util';

const toUpdatePrices = {
  baseProductPriceId: 'price_base_year',
  seats: 7,
  resourceCreditPriceId: 'price_credit_year',
};

describe('resolveManagedItemPrice', () => {
  it('prices the base product at the seat count', () => {
    expect(
      resolveManagedItemPrice({
        productKey: BillingProductKey.BASE_PRODUCT,
        toUpdatePrices,
      }),
    ).toEqual({ price: 'price_base_year', quantity: 7 });
  });

  it('prices the resource credit at a single unit', () => {
    expect(
      resolveManagedItemPrice({
        productKey: BillingProductKey.RESOURCE_CREDIT,
        toUpdatePrices,
      }),
    ).toEqual({ price: 'price_credit_year', quantity: 1 });
  });

  it('leaves an add-on unmanaged', () => {
    expect(
      resolveManagedItemPrice({
        productKey: BillingProductKey.ADD_ON,
        toUpdatePrices,
      }),
    ).toBeUndefined();
  });

  it('leaves an unresolved product key unmanaged', () => {
    expect(
      resolveManagedItemPrice({ productKey: undefined, toUpdatePrices }),
    ).toBeUndefined();
  });
});
