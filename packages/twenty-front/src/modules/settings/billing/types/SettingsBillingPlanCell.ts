import { type BillingSubscriptionChange } from '@/settings/billing/types/BillingSubscriptionChange';

export type SettingsBillingPlanCell =
  | { kind: 'current' }
  | { kind: 'scheduled' }
  | { kind: 'change'; change: BillingSubscriptionChange };
