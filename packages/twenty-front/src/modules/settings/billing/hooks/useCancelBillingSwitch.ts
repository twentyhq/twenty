import { useApplyCurrentWorkspaceBillingUpdate } from '@/settings/billing/hooks/useApplyCurrentWorkspaceBillingUpdate';
import { useGetResourceCreditUsage } from '@/settings/billing/hooks/useGetResourceCreditUsage';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { useMutation } from '@apollo/client/react';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import {
  CancelSwitchBillingIntervalDocument,
  CancelSwitchBillingPlanDocument,
} from '~/generated-metadata/graphql';

export const useCancelBillingSwitch = () => {
  const { t } = useLingui();
  const { enqueueSuccessSnackBar, enqueueErrorSnackBar } = useSnackBar();
  const { applyCurrentWorkspaceBillingUpdate } =
    useApplyCurrentWorkspaceBillingUpdate();
  const { refetchResourceCreditUsage } = useGetResourceCreditUsage();

  const [cancelSwitchBillingPlanMutation] = useMutation(
    CancelSwitchBillingPlanDocument,
  );
  const [cancelSwitchBillingIntervalMutation] = useMutation(
    CancelSwitchBillingIntervalDocument,
  );

  const [isCancellingPlanSwitch, setIsCancellingPlanSwitch] = useState(false);
  const [isCancellingIntervalSwitch, setIsCancellingIntervalSwitch] =
    useState(false);

  const runCancellation = async ({
    errorMessage,
    isCancelling,
    mutate,
    setIsCancelling,
    successMessage,
  }: {
    errorMessage: string;
    isCancelling: boolean;
    mutate: () => Promise<
      Parameters<typeof applyCurrentWorkspaceBillingUpdate>[0]
    >;
    setIsCancelling: (isCancelling: boolean) => void;
    successMessage: string;
  }) => {
    if (isCancelling) {
      return;
    }

    setIsCancelling(true);

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
      setIsCancelling(false);
    }
  };

  const cancelPlanSwitch = async () =>
    await runCancellation({
      errorMessage: t`Error while cancelling plan switching.`,
      isCancelling: isCancellingPlanSwitch,
      mutate: async () =>
        (await cancelSwitchBillingPlanMutation()).data?.cancelSwitchBillingPlan,
      setIsCancelling: setIsCancellingPlanSwitch,
      successMessage: t`Plan switching has been cancelled.`,
    });

  const cancelIntervalSwitch = async () =>
    await runCancellation({
      errorMessage: t`Error while cancelling interval switching.`,
      isCancelling: isCancellingIntervalSwitch,
      mutate: async () =>
        (await cancelSwitchBillingIntervalMutation()).data
          ?.cancelSwitchBillingInterval,
      setIsCancelling: setIsCancellingIntervalSwitch,
      successMessage: t`Interval switching has been cancelled.`,
    });

  return {
    cancelIntervalSwitch,
    cancelPlanSwitch,
    isCancellingIntervalSwitch,
    isCancellingPlanSwitch,
  };
};
