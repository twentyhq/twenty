import { isSubscriptionPaymentOverdue } from '@/settings/billing/utils/isSubscriptionPaymentOverdue';
import { isDefined } from 'twenty-shared/utils';
import { SubscriptionStatus } from '~/generated-metadata/graphql';

export type SubscriptionRecoveryResult<TWorkspaceBilling> =
  | { outcome: 'recovered'; workspaceBilling: TWorkspaceBilling }
  | { outcome: 'unrecoverable' }
  | { outcome: 'timedOut' };

export const waitForSubscriptionRecovery = async <TWorkspaceBilling>({
  fetchWorkspaceBilling,
  getSubscriptionStatus,
  waitBeforeAttempt,
  maxAttempts,
}: {
  fetchWorkspaceBilling: () => Promise<TWorkspaceBilling>;
  getSubscriptionStatus: (
    workspaceBilling: TWorkspaceBilling,
  ) => SubscriptionStatus | undefined;
  waitBeforeAttempt: () => Promise<unknown>;
  maxAttempts: number;
}): Promise<SubscriptionRecoveryResult<TWorkspaceBilling>> => {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    await waitBeforeAttempt();

    let workspaceBilling: TWorkspaceBilling;

    try {
      workspaceBilling = await fetchWorkspaceBilling();
    } catch {
      // A transient fetch failure says nothing about the payment itself
      continue;
    }

    const subscriptionStatus = getSubscriptionStatus(workspaceBilling);

    if (subscriptionStatus === SubscriptionStatus.Active) {
      return { outcome: 'recovered', workspaceBilling };
    }

    // Only a definite status that cannot recover ends the wait early, no
    // status at all is not a verdict on the payment
    if (
      isDefined(subscriptionStatus) &&
      !isSubscriptionPaymentOverdue(subscriptionStatus)
    ) {
      return { outcome: 'unrecoverable' };
    }
  }

  return { outcome: 'timedOut' };
};
