import { PAYMENT_RECOVERY_POLLING_INTERVAL_MS } from '@/settings/billing/constants/PaymentRecoveryPollingIntervalMs';
import { PAYMENT_RECOVERY_POLLING_MAX_ATTEMPTS } from '@/settings/billing/constants/PaymentRecoveryPollingMaxAttempts';
import { useApplyCurrentWorkspaceBillingUpdate } from '@/settings/billing/hooks/useApplyCurrentWorkspaceBillingUpdate';
import { useMarkBillingPaymentMethodAsAdded } from '@/settings/billing/hooks/useMarkBillingPaymentMethodAsAdded';
import { waitForSubscriptionRecovery } from '@/settings/billing/utils/waitForSubscriptionRecovery';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useLoadCurrentUser } from '@/users/hooks/useLoadCurrentUser';
import { useApolloClient } from '@apollo/client/react';
import { t } from '@lingui/core/macro';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { GetCurrentUserDocument } from '~/generated-metadata/graphql';
import { logError } from '~/utils/logError';
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
    const recovery = await waitForSubscriptionRecovery({
      fetchWorkspaceBilling,
      getSubscriptionStatus: (workspaceBilling) =>
        workspaceBilling?.currentBillingSubscription?.status,
      waitBeforeAttempt: () => sleep(PAYMENT_RECOVERY_POLLING_INTERVAL_MS),
      maxAttempts: PAYMENT_RECOVERY_POLLING_MAX_ATTEMPTS,
    });

    if (recovery.outcome !== 'recovered') {
      enqueueWarningSnackBar({
        message: t`Your card was saved, but the payment still needs attention.`,
        options: {
          buttonLabel: t`Go to billing`,
          buttonTo: getSettingsPath(SettingsPath.Billing),
        },
      });

      return;
    }

    try {
      await loadCurrentUser();
    } catch {
      const hasAppliedBillingUpdate = applyCurrentWorkspaceBillingUpdate(
        recovery.workspaceBilling,
      );

      if (!hasAppliedBillingUpdate) {
        logError(
          'Payment recovered but the workspace billing state could not be refreshed',
        );
      }
    }

    // The payment method webhook can still be in flight
    markBillingPaymentMethodAsAdded();

    enqueueSuccessSnackBar({ message: t`Payment successful.` });
  };

  return { waitForPaymentRecovery };
};
