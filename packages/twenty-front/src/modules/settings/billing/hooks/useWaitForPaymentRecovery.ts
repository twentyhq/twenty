import { PAYMENT_RECOVERY_POLLING_INTERVAL_MS } from '@/settings/billing/constants/PaymentRecoveryPollingIntervalMs';
import { PAYMENT_RECOVERY_POLLING_MAX_ATTEMPTS } from '@/settings/billing/constants/PaymentRecoveryPollingMaxAttempts';
import { useApplyCurrentWorkspaceBillingUpdate } from '@/settings/billing/hooks/useApplyCurrentWorkspaceBillingUpdate';
import { useMarkBillingPaymentMethodAsAdded } from '@/settings/billing/hooks/useMarkBillingPaymentMethodAsAdded';
import { isSubscriptionPaymentOverdue } from '@/settings/billing/utils/isSubscriptionPaymentOverdue';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useLoadCurrentUser } from '@/users/hooks/useLoadCurrentUser';
import { useApolloClient } from '@apollo/client/react';
import { t } from '@lingui/core/macro';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import {
  GetCurrentUserDocument,
  SubscriptionStatus,
} from '~/generated-metadata/graphql';
import { sleep } from '~/utils/sleep';

export const useWaitForPaymentRecovery = () => {
  const client = useApolloClient();
  const { loadCurrentUser } = useLoadCurrentUser();
  const { applyCurrentWorkspaceBillingUpdate } =
    useApplyCurrentWorkspaceBillingUpdate();
  const { markBillingPaymentMethodAsAdded } =
    useMarkBillingPaymentMethodAsAdded();
  const { enqueueSuccessSnackBar, enqueueWarningSnackBar } = useSnackBar();

  const fetchWorkspaceBilling = async () => {
    const { data } = await client.query({
      query: GetCurrentUserDocument,
      fetchPolicy: 'network-only',
    });

    return data?.currentUser.currentWorkspace;
  };

  // The retry itself runs server-side from the setup_intent.succeeded webhook
  // and only reaches the persisted subscription through the invoice and
  // subscription webhooks, so its outcome can only be observed by polling
  const waitForPaymentRecovery = async () => {
    for (
      let attempt = 0;
      attempt < PAYMENT_RECOVERY_POLLING_MAX_ATTEMPTS;
      attempt++
    ) {
      await sleep(PAYMENT_RECOVERY_POLLING_INTERVAL_MS);

      let workspaceBilling: Awaited<ReturnType<typeof fetchWorkspaceBilling>>;

      try {
        workspaceBilling = await fetchWorkspaceBilling();
      } catch {
        continue;
      }

      const subscriptionStatus =
        workspaceBilling?.currentBillingSubscription?.status;

      if (subscriptionStatus === SubscriptionStatus.Active) {
        try {
          await loadCurrentUser();
        } catch {
          applyCurrentWorkspaceBillingUpdate(workspaceBilling);
        }

        // The payment method webhook can still be in flight
        markBillingPaymentMethodAsAdded();

        enqueueSuccessSnackBar({ message: t`Payment successful.` });

        return;
      }

      if (!isSubscriptionPaymentOverdue(subscriptionStatus)) {
        break;
      }
    }

    enqueueWarningSnackBar({
      message: t`Your card was saved, but the payment still needs attention.`,
      options: {
        buttonLabel: t`Go to billing`,
        buttonTo: getSettingsPath(SettingsPath.Billing),
      },
    });
  };

  return { waitForPaymentRecovery };
};
