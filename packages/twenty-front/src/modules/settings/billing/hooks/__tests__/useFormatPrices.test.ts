import { useFormatPrices } from '@/settings/billing/hooks/useFormatPrices';
import {
  type SettingsBillingPlanInterval,
  type SettingsBillingPlanPrices,
} from '@/settings/billing/types/SettingsBillingPlanComparison';
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

const UNIT_AMOUNTS: SettingsBillingPlanPrices = {
  [BillingPlanKey.PRO]: {
    [SubscriptionInterval.Month]: 1200,
    [SubscriptionInterval.Year]: 10800,
  },
  [BillingPlanKey.ENTERPRISE]: {
    [SubscriptionInterval.Month]: 2500,
    [SubscriptionInterval.Year]: 22800,
  },
  [BillingPlanKey.PRO_V2]: {
    [SubscriptionInterval.Month]: 1500,
    [SubscriptionInterval.Year]: 14400,
  },
  [BillingPlanKey.ORGANIZATION_V2]: {
    [SubscriptionInterval.Month]: 3000,
    [SubscriptionInterval.Year]: 28800,
  },
};

describe('useFormatPrices', () => {
  beforeEach(() => {
    mockGetBaseLicensedPriceByPlanKeyAndInterval.mockReset();
  });

  it('formats monthly prices from Stripe unit amounts for every plan', () => {
    mockGetBaseLicensedPriceByPlanKeyAndInterval.mockImplementation(
      (planKey: BillingPlanKey, interval: SettingsBillingPlanInterval) => ({
        unitAmount: UNIT_AMOUNTS[planKey][interval],
      }),
    );

    const { formatPrices } = useFormatPrices();

    expect(formatPrices).toEqual({
      [BillingPlanKey.ENTERPRISE]: {
        [SubscriptionInterval.Month]: 25,
        [SubscriptionInterval.Year]: 19,
      },
      [BillingPlanKey.ORGANIZATION_V2]: {
        [SubscriptionInterval.Month]: 30,
        [SubscriptionInterval.Year]: 24,
      },
      [BillingPlanKey.PRO]: {
        [SubscriptionInterval.Month]: 12,
        [SubscriptionInterval.Year]: 9,
      },
      [BillingPlanKey.PRO_V2]: {
        [SubscriptionInterval.Month]: 15,
        [SubscriptionInterval.Year]: 12,
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
      [BillingPlanKey.ORGANIZATION_V2]: {
        [SubscriptionInterval.Month]: 25,
        [SubscriptionInterval.Year]: 19,
      },
      [BillingPlanKey.PRO]: {
        [SubscriptionInterval.Month]: 12,
        [SubscriptionInterval.Year]: 9,
      },
      [BillingPlanKey.PRO_V2]: {
        [SubscriptionInterval.Month]: 12,
        [SubscriptionInterval.Year]: 9,
      },
    });
  });
});
