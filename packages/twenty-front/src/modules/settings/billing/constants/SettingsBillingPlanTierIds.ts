import { type SettingsBillingPlanTierId } from '@/settings/billing/types/settingsBillingPlanComparison.type';

export const SETTINGS_BILLING_PLAN_TIER_IDS = [
  'pro',
  'organization',
] as const satisfies SettingsBillingPlanTierId[];
