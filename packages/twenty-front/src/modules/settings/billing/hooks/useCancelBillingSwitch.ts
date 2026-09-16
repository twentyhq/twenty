import { useBillingUpdateMutation } from '@/settings/billing/hooks/useBillingUpdateMutation';
import { useMutation } from '@apollo/client/react';
import { useLingui } from '@lingui/react/macro';
import {
  CancelSwitchBillingIntervalDocument,
  CancelSwitchBillingPlanDocument,
} from '~/generated-metadata/graphql';

export const useCancelBillingSwitch = () => {
  const { t } = useLingui();

  const {
    isMutationRunning: isCancellingPlanSwitch,
    runBillingUpdateMutation: runPlanSwitchCancellation,
  } = useBillingUpdateMutation();
  const {
    isMutationRunning: isCancellingIntervalSwitch,
    runBillingUpdateMutation: runIntervalSwitchCancellation,
  } = useBillingUpdateMutation();

  const [cancelSwitchBillingPlanMutation] = useMutation(
    CancelSwitchBillingPlanDocument,
  );
  const [cancelSwitchBillingIntervalMutation] = useMutation(
    CancelSwitchBillingIntervalDocument,
  );

  const cancelPlanSwitch = async () =>
    await runPlanSwitchCancellation({
      errorMessage: t`Error while cancelling plan switching.`,
      mutate: async () =>
        (await cancelSwitchBillingPlanMutation()).data?.cancelSwitchBillingPlan,
      successMessage: t`Plan switching has been cancelled.`,
    });

  const cancelIntervalSwitch = async () =>
    await runIntervalSwitchCancellation({
      errorMessage: t`Error while cancelling interval switching.`,
      mutate: async () =>
        (await cancelSwitchBillingIntervalMutation()).data
          ?.cancelSwitchBillingInterval,
      successMessage: t`Interval switching has been cancelled.`,
    });

  return {
    cancelIntervalSwitch,
    cancelPlanSwitch,
    isCancellingIntervalSwitch,
    isCancellingPlanSwitch,
  };
};
