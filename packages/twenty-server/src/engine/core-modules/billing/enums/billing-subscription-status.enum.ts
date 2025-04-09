/* @license Enterprise */

export enum SubscriptionStatus {
  Active = 'active',
  Canceled = 'canceled',
  Incomplete = 'incomplete',
  IncompleteExpired = 'incomplete_expired',
  PastDue = 'past_due',
  Paused = 'paused', // TODO: remove this once paused subscriptions are deprecated
  Trialing = 'trialing',
  Unpaid = 'unpaid',
}
