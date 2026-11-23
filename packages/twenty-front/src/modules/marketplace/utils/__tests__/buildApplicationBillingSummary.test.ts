import { type ApplicationBillingPrice } from '~/generated-metadata/graphql';
import { buildApplicationBillingSummary } from '@/marketplace/utils/buildApplicationBillingSummary';

const buildPrice = (
  overrides: Partial<ApplicationBillingPrice>,
): ApplicationBillingPrice => ({
  universalIdentifier: 'price-id',
  label: 'Price',
  type: 'RECURRING',
  billingPeriod: 'MONTHLY',
  amountCents: 700,
  currency: 'USD',
  per: null,
  ...overrides,
});

const getLabels = ({
  billsCredits = false,
  billingPrices = [],
}: {
  billsCredits?: boolean;
  billingPrices?: ApplicationBillingPrice[];
}) =>
  buildApplicationBillingSummary({
    billsCredits,
    billingPrices,
    appDisplayName: 'LinkedIn',
    formatPriceAmount: ({ amountCents }) =>
      `$${(amountCents / 100).toFixed(2)}`,
  }).map(({ label }) => label);

describe('buildApplicationBillingSummary', () => {
  it('describes each subscription price by its unit and period', () => {
    expect(
      getLabels({
        billingPrices: [
          buildPrice({ per: 'CONNECTED_ACCOUNT' }),
          buildPrice({ per: 'WORKSPACE_MEMBER', amountCents: 300 }),
          buildPrice({ amountCents: 2000 }),
          buildPrice({ type: 'ONE_TIME', billingPeriod: 'ONCE' }),
        ],
      }),
    ).toEqual([
      'Bill your workspace $7.00 for each LinkedIn connected account each month',
      'Bill your workspace $3.00 for each workspace member each month',
      'Bill your workspace $20.00 each month',
      'Bill your workspace $7.00 once',
    ]);
  });

  it('asks consent to bill credits during installation', () => {
    expect(getLabels({ billsCredits: true })).toEqual([
      'Bill credits to your workspace',
    ]);
  });

  it('asks nothing for a free app', () => {
    expect(getLabels({})).toEqual([]);
  });
});
