import { type MessageDescriptor } from '@lingui/core';
import {
  type BillingPlanKey,
  type SubscriptionInterval,
} from '~/generated-metadata/graphql';

export type SettingsBillingPlanInterval =
  | SubscriptionInterval.Month
  | SubscriptionInterval.Year;

export type SettingsBillingPlanPrices = Record<
  BillingPlanKey,
  Record<SettingsBillingPlanInterval, number>
>;

export type SettingsBillingPlanComparisonCell =
  | { kind: 'excluded' }
  | { kind: 'included' }
  | { kind: 'text'; text: MessageDescriptor };

export type SettingsBillingPlanComparisonCategoryRow = {
  title: MessageDescriptor;
  type: 'category';
};

export type SettingsBillingPlanComparisonFeatureRow = {
  featureLabel: MessageDescriptor;
  plans: Record<BillingPlanKey, SettingsBillingPlanComparisonCell>;
  type: 'feature';
};

export type SettingsBillingPlanComparisonRow =
  | SettingsBillingPlanComparisonCategoryRow
  | SettingsBillingPlanComparisonFeatureRow;
