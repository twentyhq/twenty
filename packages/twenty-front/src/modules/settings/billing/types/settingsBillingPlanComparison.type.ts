import { type MessageDescriptor } from '@lingui/core';
import { type SubscriptionInterval } from '~/generated-metadata/graphql';

export type SettingsBillingPlanTierId = 'organization' | 'pro';

export type SettingsBillingPlanPrices = Record<
  SettingsBillingPlanTierId,
  Record<SubscriptionInterval.Month | SubscriptionInterval.Year, number>
>;

export type SettingsBillingPlanComparisonCell =
  | { kind: 'dash' }
  | { kind: 'text'; text: MessageDescriptor }
  | { kind: 'yes'; label?: MessageDescriptor };

export type SettingsBillingPlanComparisonCategoryRow = {
  title: MessageDescriptor;
  type: 'category';
};

export type SettingsBillingPlanComparisonFeatureRow = {
  featureLabel: MessageDescriptor;
  tiers: Record<SettingsBillingPlanTierId, SettingsBillingPlanComparisonCell>;
  type: 'row';
};

export type SettingsBillingPlanComparisonRow =
  | SettingsBillingPlanComparisonCategoryRow
  | SettingsBillingPlanComparisonFeatureRow;
