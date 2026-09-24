import { SubscriptionStatus } from '~/generated-metadata/graphql';

export const isSubscriptionPaymentOverdue = (
  subscriptionStatus: SubscriptionStatus | undefined,
) =>
  subscriptionStatus === SubscriptionStatus.PastDue ||
  subscriptionStatus === SubscriptionStatus.Unpaid;
