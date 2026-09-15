import { msg } from '@lingui/core/macro';
import { type MessageDescriptor } from '@lingui/core';

import { type SubscriptionInactiveReason } from 'src/engine/core-modules/billing/types/subscription-inactive-reason.type';

export const SUBSCRIPTION_INACTIVE_REASON_USER_FRIENDLY_MESSAGE: Record<
  SubscriptionInactiveReason,
  MessageDescriptor
> = {
  WORKSPACE_SUSPENDED: msg`This workspace is suspended.`,
  NO_SUBSCRIPTION: msg`This workspace has no active subscription.`,
};
