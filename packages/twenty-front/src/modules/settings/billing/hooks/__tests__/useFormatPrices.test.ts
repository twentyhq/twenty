import { useFormatPrices } from '@/settings/billing/hooks/useFormatPrices';
import {
  BillingPlanKey,
  SubscriptionInterval,
} from '~/generated-metadata/graphql';

const mockGetBaseLicensedPriceByPlanKeyAndInterval = jest.fn();

jest.mock(
  '@/settings/billing/hooks/useBaseLicensedPriceByPlanKeyAndInterval',
  () => ({
    useBaseLicensedPriceByPlanKeyAndInterval: () => ({
      getBaseLicensedPriceByPlanKeyAndInterval:
        mockGetBaseLicensedPriceByPlanKeyAndInterval,
    }),
  }),
);

describe('useFormatPrices', () => {
  beforeEach(() => {
    mockGetBaseLicensedPriceByPlanKeyAndInterval.mockReset();
  });

  it('formats monthly prices from Stripe unit amounts', () => {
    mockGetBaseLicensedPriceByPlanKeyAndInterval.mockImplementation(
      (planKey: BillingPlanKey, interval: SubscriptionInterval) => ({
        unitAmount:
          planKey === BillingPlanKey.PRO
            ? interval === SubscriptionInterval.Year
              ? 10800
              : 1200
            : interval === SubscriptionInterval.Year
              ? 22800
              : 2500,
      }),
    );

    const { formatPrices } = useFormatPrices();

    expect(formatPrices).toEqual({
      [BillingPlanKey.ENTERPRISE]: {
        [SubscriptionInterval.Month]: 25,
        [SubscriptionInterval.Year]: 19,
      },
      [BillingPlanKey.PRO]: {
        [SubscriptionInterval.Month]: 12,
        [SubscriptionInterval.Year]: 9,
      },
    });
  });

  it('uses fallback prices when plan data is incomplete', () => {
    mockGetBaseLicensedPriceByPlanKeyAndInterval.mockImplementation(() => {
      throw new Error('Base licensed price not found');
    });

    const { formatPrices } = useFormatPrices();

    expect(formatPrices).toEqual({
      [BillingPlanKey.ENTERPRISE]: {
        [SubscriptionInterval.Month]: 25,
        [SubscriptionInterval.Year]: 19,
      },
      [BillingPlanKey.PRO]: {
        [SubscriptionInterval.Month]: 12,
        [SubscriptionInterval.Year]: 9,
      },
    });
  });
});
