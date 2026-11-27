import { type ApplicationBillingPrice } from 'twenty-shared/application';

import { resolveAcceptedBillingPricesOnInstallCompleted } from 'src/engine/core-modules/application/utils/resolve-accepted-billing-prices-on-install-completed.util';

const buildPrice = (
  overrides: Partial<ApplicationBillingPrice> = {},
): ApplicationBillingPrice => ({
  universalIdentifier: 'b7e41d08-2a93-4f5c-8d16-0c9e3b5a7f21',
  label: 'Platform fee',
  type: 'RECURRING',
  billingPeriod: 'MONTHLY',
  amountCents: 1000,
  ...overrides,
});

describe('resolveAcceptedBillingPricesOnInstallCompleted', () => {
  it('accepts the declared prices on a first install', () => {
    expect(
      resolveAcceptedBillingPricesOnInstallCompleted({
        previousVersion: undefined,
        manifestBilling: { prices: [buildPrice()] },
      }),
    ).toEqual([buildPrice()]);
  });

  it('accepts an empty price set on a first install of a free application', () => {
    expect(
      resolveAcceptedBillingPricesOnInstallCompleted({
        previousVersion: null,
        manifestBilling: undefined,
      }),
    ).toEqual([]);
  });

  it.each<[string, ApplicationBillingPrice[] | undefined]>([
    ['raises its amount', [buildPrice({ amountCents: 2000 })]],
    ['changes its unit', [buildPrice({ per: 'WORKSPACE_MEMBER' })]],
    [
      'replaces its price',
      [
        buildPrice({
          universalIdentifier: 'c1f5a3d2-7b64-4e89-9a10-2d8f6e4b3c57',
        }),
      ],
    ],
    ['removes its prices', undefined],
    ['starts declaring a price', [buildPrice()]],
  ])('leaves the accepted prices untouched when an upgrade %s', (_, prices) => {
    expect(
      resolveAcceptedBillingPricesOnInstallCompleted({
        previousVersion: '1.0.0',
        manifestBilling: { prices },
      }),
    ).toBeUndefined();
  });
});
