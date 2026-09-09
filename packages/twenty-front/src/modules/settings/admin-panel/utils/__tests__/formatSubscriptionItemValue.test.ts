import { formatSubscriptionItemValue } from '@/settings/admin-panel/utils/formatSubscriptionItemValue';
import { BillingProductKey } from '~/generated-metadata/graphql';

const formatNumber = (value: number, options?: { decimals?: number }) =>
  value.toFixed(options?.decimals ?? 0);

const format = (
  item: Parameters<typeof formatSubscriptionItemValue>[0]['item'],
) => formatSubscriptionItemValue({ item, currency: 'USD', formatNumber });

describe('formatSubscriptionItemValue', () => {
  it('calls a base-product quantity seats', () => {
    expect(
      format({ productKey: BillingProductKey.BASE_PRODUCT, quantity: 3 }),
    ).toBe('3 seats');
  });

  it('does not call a metered quantity seats', () => {
    expect(
      format({ productKey: BillingProductKey.RESOURCE_CREDIT, quantity: 1 }),
    ).toBe('1');
  });

  it('does not call an unknown product quantity seats', () => {
    expect(format({ productKey: null, quantity: 2 })).toBe('2');
  });

  it('agrees in number with a single seat', () => {
    expect(
      format({ productKey: BillingProductKey.BASE_PRODUCT, quantity: 1 }),
    ).toBe('1 seat');
  });

  it('agrees in number with a single included credit', () => {
    expect(
      format({
        productKey: BillingProductKey.RESOURCE_CREDIT,
        includedCredits: 1,
      }),
    ).toBe('1.00 credit/period');
  });

  it('joins quantity, included credits and unit amount', () => {
    expect(
      format({
        productKey: BillingProductKey.BASE_PRODUCT,
        quantity: 3,
        includedCredits: 5,
        unitAmount: 2500,
      }),
    ).toBe('3 seats · 5.00 credits/period · $25.00');
  });

  it('renders an em dash when the item carries nothing to show', () => {
    expect(format({ productKey: BillingProductKey.RESOURCE_CREDIT })).toBe('—');
  });

  it('keeps a zero quantity rather than reading it as absent', () => {
    expect(
      format({ productKey: BillingProductKey.BASE_PRODUCT, quantity: 0 }),
    ).toBe('0 seats');
  });

  it('formats the amount through the caller formatter, not its own', () => {
    // The digits have to honour the workspace member's number format, so the
    // injected formatter is what decides how an amount reads.
    expect(
      formatSubscriptionItemValue({
        item: {
          productKey: BillingProductKey.BASE_PRODUCT,
          unitAmount: 123456,
        },
        currency: 'EUR',
        formatNumber: (value) => `<${value}>`,
      }),
    ).toBe('\u20ac<1234.56>');
  });

  it('falls back to the code when the currency has no resolvable symbol', () => {
    expect(
      formatSubscriptionItemValue({
        item: { productKey: BillingProductKey.BASE_PRODUCT, unitAmount: 1500 },
        currency: 'US',
        formatNumber,
      }),
    ).toBe('US15.00');
  });
});
