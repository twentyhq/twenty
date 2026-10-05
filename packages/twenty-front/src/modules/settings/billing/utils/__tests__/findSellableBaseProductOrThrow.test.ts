import { findSellableBaseProductOrThrow } from '@/settings/billing/utils/findSellableBaseProductOrThrow';
import { BillingProductKey } from '~/generated-metadata/graphql';

const buildProduct = (
  name: string,
  {
    isLegacy,
    productKey = BillingProductKey.BASE_PRODUCT,
  }: {
    isLegacy?: string;
    productKey?: BillingProductKey;
  } = {},
) => ({ name, metadata: { productKey, isLegacy } });

describe('findSellableBaseProductOrThrow', () => {
  it('returns the only sellable base product', () => {
    const current = buildProduct('Pro');

    expect(
      findSellableBaseProductOrThrow([
        current,
        buildProduct('Credits', {
          productKey: BillingProductKey.RESOURCE_CREDIT,
        }),
      ]),
    ).toBe(current);
  });

  it('skips a superseded base product', () => {
    const current = buildProduct('Pro');

    expect(
      findSellableBaseProductOrThrow([
        buildProduct('Pro legacy', { isLegacy: 'true' }),
        current,
      ]),
    ).toBe(current);
  });

  it('throws rather than pick between two sellable base products', () => {
    expect(() =>
      findSellableBaseProductOrThrow([
        buildProduct('Pro'),
        buildProduct('Pro next'),
      ]),
    ).toThrow(/found 2/);
  });
});
