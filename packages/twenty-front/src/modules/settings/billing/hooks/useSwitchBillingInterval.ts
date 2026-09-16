import { useBillingWording } from '@/settings/billing/hooks/useBillingWording';
import { useCurrentBillingFlags } from '@/settings/billing/hooks/useCurrentBillingFlags';
import { useRunBillingUpdate } from '@/settings/billing/hooks/useRunBillingUpdate';
import { useSubscriptionStatus } from '@/workspace/hooks/useSubscriptionStatus';
import { useMutation } from '@apollo/client/react';
import { useLingui } from '@lingui/react/macro';
import {
  SubscriptionStatus,
  SwitchSubscriptionIntervalDocument,
} from '~/generated-metadata/graphql';

export const useSwitchBillingInterval = () => {
  const { t } = useLingui();
  const subscriptionStatus = useSubscriptionStatus();
  const { isMonthlyPlan } = useCurrentBillingFlags();
  const { getBeautifiedRenewDate } = useBillingWording();

  const [switchSubscriptionIntervalMutation] = useMutation(
    SwitchSubscriptionIntervalDocument,
  );

  const { isBillingUpdateRunning, runBillingUpdate } = useRunBillingUpdate({
    mutate: async () =>
      (await switchSubscriptionIntervalMutation()).data
        ?.switchSubscriptionInterval,
  });

  const getSuccessMessage = () => {
    if (isMonthlyPlan) {
      return t`Subscription has been switched to Yearly.`;
    }

    return subscriptionStatus === SubscriptionStatus.Trialing
      ? t`Subscription has been switched to Monthly.`
      : t`Subscription will be switched to Monthly the ${getBeautifiedRenewDate()}.`;
  };

  const switchBillingInterval = async () =>
    await runBillingUpdate({
      getErrorMessage: () => t`Error while switching subscription.`,
      getSuccessMessage,
    });

  return {
    isSwitchingInterval: isBillingUpdateRunning,
    switchBillingInterval,
  };
};
