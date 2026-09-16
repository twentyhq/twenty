import { useRunBillingUpdate } from '@/settings/billing/hooks/useRunBillingUpdate';
import { useMutation } from '@apollo/client/react';
import { useLingui } from '@lingui/react/macro';
import {
  CancelSwitchBillingIntervalDocument,
  CancelSwitchBillingPlanDocument,
} from '~/generated-metadata/graphql';

export const useCancelBillingSwitch = () => {
  const { t } = useLingui();

  const [cancelSwitchBillingPlanMutation] = useMutation(
    CancelSwitchBillingPlanDocument,
  );
  const [cancelSwitchBillingIntervalMutation] = useMutation(
    CancelSwitchBillingIntervalDocument,
  );

  const { runBillingUpdate: runPlanSwitchCancellation } = useRunBillingUpdate({
    mutate: async () =>
      (await cancelSwitchBillingPlanMutation()).data?.cancelSwitchBillingPlan,
  });

  const { runBillingUpdate: runIntervalSwitchCancellation } =
    useRunBillingUpdate({
      mutate: async () =>
        (await cancelSwitchBillingIntervalMutation()).data
          ?.cancelSwitchBillingInterval,
    });

  const cancelPlanSwitch = async () =>
    await runPlanSwitchCancellation({
      getErrorMessage: () => t`Error while cancelling plan switching.`,
      getSuccessMessage: () => t`Plan switching has been cancelled.`,
    });

  const cancelIntervalSwitch = async () =>
    await runIntervalSwitchCancellation({
      getErrorMessage: () => t`Error while cancelling interval switching.`,
      getSuccessMessage: () => t`Interval switching has been cancelled.`,
    });

  return { cancelIntervalSwitch, cancelPlanSwitch };
};
