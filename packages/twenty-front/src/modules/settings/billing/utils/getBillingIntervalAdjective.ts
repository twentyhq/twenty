import { t } from '@lingui/core/macro';
import { type SettingsBillingPlanInterval } from '@/settings/billing/types/settingsBillingPlanComparison.type';
import { SubscriptionInterval } from '~/generated-metadata/graphql';

export const getBillingIntervalAdjective = (
  interval: SettingsBillingPlanInterval,
): string => (interval === SubscriptionInterval.Month ? t`monthly` : t`yearly`);
