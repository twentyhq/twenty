import { type CurrentWorkspace } from '@/auth/states/currentWorkspaceState';
import { BillingProductKey } from '~/generated-metadata/graphql';

type CurrentWorkspaceBillingSubscriptionItem = NonNullable<
  NonNullable<
    CurrentWorkspace['currentBillingSubscription']
  >['billingSubscriptionItems']
>[number];

export const isResourceCreditSubscriptionItem = (
  billingSubscriptionItem: CurrentWorkspaceBillingSubscriptionItem,
): boolean =>
  billingSubscriptionItem.billingProduct.metadata?.['productKey'] ===
  BillingProductKey.RESOURCE_CREDIT;
