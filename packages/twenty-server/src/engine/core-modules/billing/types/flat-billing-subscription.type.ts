/* @license Enterprise */

import { NO_BILLING_SUBSCRIPTION } from 'src/engine/core-modules/billing/constants/no-billing-subscription.constant';
import { type BillingSubscriptionCollectionMethod } from 'src/engine/core-modules/billing/enums/billing-subscription-collection-method.enum';
import { type SubscriptionInterval } from 'src/engine/core-modules/billing/enums/billing-subscription-interval.enum';
import { type SubscriptionStatus } from 'src/engine/core-modules/billing/enums/billing-subscription-status.enum';

export type FlatBillingSubscription = {
  id: string;
  workspaceId: string;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  status: SubscriptionStatus;
  interval: SubscriptionInterval;
  currency: string;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  cancelAt: Date | null;
  canceledAt: Date | null;
  endedAt: Date | null;
  trialStart: Date | null;
  trialEnd: Date | null;
  collectionMethod: BillingSubscriptionCollectionMethod;
};

export type CurrentBillingSubscription =
  | FlatBillingSubscription
  | typeof NO_BILLING_SUBSCRIPTION;
