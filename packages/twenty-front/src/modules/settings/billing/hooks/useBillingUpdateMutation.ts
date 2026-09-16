import { useApplyCurrentWorkspaceBillingUpdate } from '@/settings/billing/hooks/useApplyCurrentWorkspaceBillingUpdate';
import { useGetResourceCreditUsage } from '@/settings/billing/hooks/useGetResourceCreditUsage';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { useState } from 'react';
import { type CurrentWorkspace } from '@/auth/states/currentWorkspaceState';

type BillingUpdate =
  | Pick<
      CurrentWorkspace,
      'billingSubscriptions' | 'currentBillingSubscription'
    >
  | null
  | undefined;

export const useBillingUpdateMutation = () => {
  const { enqueueSuccessSnackBar, enqueueErrorSnackBar } = useSnackBar();
  const { applyCurrentWorkspaceBillingUpdate } =
    useApplyCurrentWorkspaceBillingUpdate();
  const { refetchResourceCreditUsage } = useGetResourceCreditUsage();

  const [isMutationRunning, setIsMutationRunning] = useState(false);

  const runBillingUpdateMutation = async ({
    errorMessage,
    mutate,
    successMessage,
  }: {
    errorMessage: string;
    mutate: () => Promise<BillingUpdate>;
    successMessage: string;
  }) => {
    if (isMutationRunning) {
      return;
    }

    setIsMutationRunning(true);

    try {
      const billingUpdate = await mutate();
      const isBillingUpdateApplied = applyCurrentWorkspaceBillingUpdate(
        billingUpdate,
        { onBillingUpdateApplied: refetchResourceCreditUsage },
      );

      if (!isBillingUpdateApplied) {
        enqueueErrorSnackBar({ message: errorMessage });
        return;
      }

      enqueueSuccessSnackBar({ message: successMessage });
    } catch (error) {
      enqueueErrorSnackBar({ message: errorMessage });

      if (!CombinedGraphQLErrors.is(error)) {
        throw error;
      }
    } finally {
      setIsMutationRunning(false);
    }
  };

  return {
    isMutationRunning,
    runBillingUpdateMutation,
  };
};
