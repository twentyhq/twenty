import { BillingException } from 'src/engine/core-modules/billing/billing.exception';
import { type BillingPriceEntity } from 'src/engine/core-modules/billing/entities/billing-price.entity';
import { type BillingProductEntity } from 'src/engine/core-modules/billing/entities/billing-product.entity';
import { BillingProductKey } from 'src/engine/core-modules/billing/enums/billing-product-key.enum';
import { findSellableBaseProductPriceOrThrow } from 'src/engine/core-modules/billing/utils/find-sellable-base-product-price-or-throw.util';

const buildProduct = ({
  productKey = BillingProductKey.BASE_PRODUCT,
  active = true,
  isLegacy,
}: {
  productKey?: BillingProductKey;
  active?: boolean;
  isLegacy?: string;
} = {}) =>
  ({
    active,
    metadata: { productKey, ...(isLegacy ? { isLegacy } : {}) },
  }) as unknown as BillingProductEntity;

const buildPrice = ({
  stripePriceId,
  active = true,
  isLegacy,
  billingProduct = buildProduct(),
}: {
  stripePriceId: string;
  active?: boolean;
  isLegacy?: string;
  billingProduct?: BillingProductEntity;
}) =>
  ({
    stripePriceId,
    active,
    metadata: isLegacy ? { isLegacy } : {},
    billingProduct,
  }) as unknown as BillingPriceEntity;

describe('findSellableBaseProductPriceOrThrow', () => {
  it('returns the only sellable base product price', () => {
    const price = buildPrice({ stripePriceId: 'price_current' });

    expect(
      findSellableBaseProductPriceOrThrow([
        price,
        buildPrice({
          stripePriceId: 'price_credits',
          billingProduct: buildProduct({
            productKey: BillingProductKey.RESOURCE_CREDIT,
          }),
        }),
      ]),
    ).toBe(price);
  });

  it('skips a price on a product marked legacy', () => {
    const current = buildPrice({ stripePriceId: 'price_current' });
    const legacy = buildPrice({
      stripePriceId: 'price_legacy',
      billingProduct: buildProduct({ isLegacy: 'true' }),
    });

    expect(findSellableBaseProductPriceOrThrow([legacy, current])).toBe(
      current,
    );
  });

  it('skips a price marked legacy on a still-sellable product', () => {
    const current = buildPrice({ stripePriceId: 'price_current' });
    const legacy = buildPrice({
      stripePriceId: 'price_legacy',
      isLegacy: 'true',
    });

    expect(findSellableBaseProductPriceOrThrow([legacy, current])).toBe(
      current,
    );
  });

  it('skips an archived price', () => {
    const current = buildPrice({ stripePriceId: 'price_current' });
    const archived = buildPrice({
      stripePriceId: 'price_archived',
      active: false,
    });

    expect(findSellableBaseProductPriceOrThrow([archived, current])).toBe(
      current,
    );
  });

  it('throws when nothing is sellable', () => {
    expect(() =>
      findSellableBaseProductPriceOrThrow([
        buildPrice({ stripePriceId: 'price_legacy', isLegacy: 'true' }),
      ]),
    ).toThrow(BillingException);
  });

  it('throws rather than pick when two sellable base prices are live', () => {
    expect(() =>
      findSellableBaseProductPriceOrThrow([
        buildPrice({ stripePriceId: 'price_old' }),
        buildPrice({ stripePriceId: 'price_new' }),
      ]),
    ).toThrow(/price_old, price_new/);
  });
});
