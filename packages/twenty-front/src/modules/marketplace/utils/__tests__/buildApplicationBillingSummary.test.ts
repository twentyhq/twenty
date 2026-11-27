import { buildApplicationBillingSummary } from '@/marketplace/utils/buildApplicationBillingSummary';
import {
  ApplicationBillingPriceCurrency,
  ApplicationBillingPriceUnit,
} from '~/generated-metadata/graphql';

const formatAmount = ({ amountCents }: { amountCents: number }) =>
  `$${(amountCents / 100).toFixed(2)}`;

const buildLabels = (
  ...args: Parameters<typeof buildApplicationBillingSummary>
) => buildApplicationBillingSummary(...args).map(({ label }) => label);

describe('buildApplicationBillingSummary', () => {
  it('lists each price with its unit', () => {
    expect(
      buildLabels({
        billsCredits: false,
        billingPrices: [
          {
            amountCents: 700,
            currency: ApplicationBillingPriceCurrency.USD,
            per: ApplicationBillingPriceUnit.CONNECTED_ACCOUNT,
          },
          {
            amountCents: 1500,
            currency: ApplicationBillingPriceCurrency.USD,
            per: ApplicationBillingPriceUnit.WORKSPACE_MEMBER,
          },
          {
            amountCents: 2000,
            currency: ApplicationBillingPriceCurrency.USD,
            per: null,
          },
        ],
        formatAmount,
      }),
    ).toEqual([
      'Bill your workspace $7.00 / month per account',
      'Bill your workspace $15.00 / month per member',
      'Bill your workspace $20.00 / month',
      'Let members connect their own accounts',
    ]);
  });

  it('emphasizes the monthly price', () => {
    expect(
      buildApplicationBillingSummary({
        billsCredits: false,
        billingPrices: [
          {
            amountCents: 700,
            currency: ApplicationBillingPriceCurrency.USD,
            per: null,
          },
        ],
        formatAmount,
      })[0].emphasis,
    ).toEqual('$7.00 / month');
  });

  it('asks consent to bill credits', () => {
    expect(
      buildLabels({ billsCredits: true, billingPrices: [], formatAmount }),
    ).toEqual(['Bill credits to your workspace']);
  });

  it('asks nothing for a free app', () => {
    expect(
      buildLabels({ billsCredits: false, billingPrices: [], formatAmount }),
    ).toEqual([]);
  });
});
