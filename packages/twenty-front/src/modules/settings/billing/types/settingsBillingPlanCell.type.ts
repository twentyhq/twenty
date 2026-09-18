import { type BillingSubscriptionChange } from '@/settings/billing/types/billingSubscriptionChange.type';

export type SettingsBillingPlanCell =
  | { kind: 'current' }
  | { kind: 'scheduled' }
  | { kind: 'change'; change: BillingSubscriptionChange };
