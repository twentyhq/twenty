import { type SubscriptionInactiveReason } from 'src/engine/core-modules/billing/types/subscription-inactive-reason.type';
import { type ExhaustedScope } from 'src/engine/core-modules/usage-limit/types/exhausted-scope.type';

export type UsageRefusal =
  | { kind: 'subscriptionInactive'; reason: SubscriptionInactiveReason }
  | { kind: 'quotaExhausted'; exhaustedScope: ExhaustedScope };
