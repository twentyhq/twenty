import {
  BillingPlanKey,
  SubscriptionInterval,
} from '~/generated-metadata/graphql';

import { type SettingsBillingPlanPrices } from '@/settings/billing/types/settingsBillingPlanComparison.type';

export const SETTINGS_BILLING_PLAN_PRICE_FALLBACKS = {
  [BillingPlanKey.PRO]: {
    [SubscriptionInterval.Month]: 12,
    [SubscriptionInterval.Year]: 9,
  },
  [BillingPlanKey.ENTERPRISE]: {
    [SubscriptionInterval.Month]: 25,
    [SubscriptionInterval.Year]: 19,
  },
} satisfies SettingsBillingPlanPrices;
