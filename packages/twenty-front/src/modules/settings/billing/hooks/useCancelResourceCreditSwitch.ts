import { useRunBillingUpdate } from '@/settings/billing/hooks/useRunBillingUpdate';
import { useMutation } from '@apollo/client/react';
import { useLingui } from '@lingui/react/macro';
import { CancelSwitchResourceCreditPriceDocument } from '~/generated-metadata/graphql';

export const useCancelResourceCreditSwitch = () => {
  const { t } = useLingui();

  const [cancelSwitchResourceCreditPriceMutation] = useMutation(
    CancelSwitchResourceCreditPriceDocument,
  );

  const { isBillingUpdateRunning, runBillingUpdate } = useRunBillingUpdate({
    kind: 'RESOURCE_CREDIT_SWITCH_CANCELLATION',
    mutate: async () =>
      (await cancelSwitchResourceCreditPriceMutation()).data
        ?.cancelSwitchResourceCreditPrice,
  });

  const cancelResourceCreditSwitch = async () =>
    await runBillingUpdate({
      getErrorMessage: () => t`Error while cancelling credit pack switching.`,
      getSuccessMessage: () => t`Credit pack switching has been cancelled.`,
    });

  return {
    cancelResourceCreditSwitch,
    isCancellingResourceCreditSwitch: isBillingUpdateRunning,
  };
};
