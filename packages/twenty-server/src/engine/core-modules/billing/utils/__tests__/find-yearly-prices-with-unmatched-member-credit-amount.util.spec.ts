/* @license Enterprise */

import { SubscriptionInterval } from 'src/engine/core-modules/billing/enums/billing-subscription-interval.enum';
import { findYearlyPricesWithUnmatchedMemberCreditAmount } from 'src/engine/core-modules/billing/utils/find-yearly-prices-with-unmatched-member-credit-amount.util';

const SEAT_PRODUCT_ID = 'prod_seat';
const OTHER_SEAT_PRODUCT_ID = 'prod_other_seat';
const RESOURCE_CREDIT_PRODUCT_ID = 'prod_resource_credit';

const buildPrice = ({
  stripePriceId,
  stripeProductId = SEAT_PRODUCT_ID,
  active = true,
  interval,
  metadata,
}: {
  stripePriceId: string;
  stripeProductId?: string;
  active?: boolean;
  interval: SubscriptionInterval;
  metadata: Record<string, string>;
}) => ({ stripePriceId, stripeProductId, active, interval, metadata });

const findUnmatchedPriceIds = (prices: ReturnType<typeof buildPrice>[]) =>
  findYearlyPricesWithUnmatchedMemberCreditAmount({
    prices,
    baseProductStripeIds: [SEAT_PRODUCT_ID, OTHER_SEAT_PRODUCT_ID],
  }).map(({ stripePriceId }) => stripePriceId);

describe('findYearlyPricesWithUnmatchedMemberCreditAmount', () => {
  it('accepts a yearly amount carried by a monthly price of the same product', () => {
    expect(
      findUnmatchedPriceIds([
        buildPrice({
          stripePriceId: 'price_monthly',
          interval: SubscriptionInterval.Month,
          metadata: { member_credit_amount: '3000000' },
        }),
        buildPrice({
          stripePriceId: 'price_yearly',
          interval: SubscriptionInterval.Year,
          metadata: { member_credit_amount: '3000000' },
        }),
      ]),
    ).toEqual([]);
  });

  it('reports a yearly amount scaled to the year', () => {
    expect(
      findUnmatchedPriceIds([
        buildPrice({
          stripePriceId: 'price_monthly',
          interval: SubscriptionInterval.Month,
          metadata: { member_credit_amount: '3000000' },
        }),
        buildPrice({
          stripePriceId: 'price_yearly',
          interval: SubscriptionInterval.Year,
          metadata: { member_credit_amount: '36000000' },
        }),
      ]),
    ).toEqual(['price_yearly']);
  });

  it('ignores the amounts of archived monthly prices', () => {
    expect(
      findUnmatchedPriceIds([
        buildPrice({
          stripePriceId: 'price_monthly_archived',
          active: false,
          interval: SubscriptionInterval.Month,
          metadata: { member_credit_amount: '3000000' },
        }),
        buildPrice({
          stripePriceId: 'price_yearly',
          interval: SubscriptionInterval.Year,
          metadata: { member_credit_amount: '3000000' },
        }),
      ]),
    ).toEqual(['price_yearly']);
  });

  it('only compares prices of the same product', () => {
    expect(
      findUnmatchedPriceIds([
        buildPrice({
          stripePriceId: 'price_other_monthly',
          stripeProductId: OTHER_SEAT_PRODUCT_ID,
          interval: SubscriptionInterval.Month,
          metadata: { member_credit_amount: '3000000' },
        }),
        buildPrice({
          stripePriceId: 'price_yearly',
          interval: SubscriptionInterval.Year,
          metadata: { member_credit_amount: '3000000' },
        }),
      ]),
    ).toEqual(['price_yearly']);
  });

  it('ignores yearly prices without a member credit amount', () => {
    expect(
      findUnmatchedPriceIds([
        buildPrice({
          stripePriceId: 'price_yearly',
          interval: SubscriptionInterval.Year,
          metadata: {},
        }),
      ]),
    ).toEqual([]);
  });

  it('ignores prices outside the seat products', () => {
    expect(
      findUnmatchedPriceIds([
        buildPrice({
          stripePriceId: 'price_resource_credit_yearly',
          stripeProductId: RESOURCE_CREDIT_PRODUCT_ID,
          interval: SubscriptionInterval.Year,
          metadata: { member_credit_amount: '3000000' },
        }),
      ]),
    ).toEqual([]);
  });
});
