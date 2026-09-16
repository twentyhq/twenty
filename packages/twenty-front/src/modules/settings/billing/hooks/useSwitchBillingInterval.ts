import { useBillingUpdateMutation } from '@/settings/billing/hooks/useBillingUpdateMutation';
import { useBillingWording } from '@/settings/billing/hooks/useBillingWording';
import { useCurrentBillingFlags } from '@/settings/billing/hooks/useCurrentBillingFlags';
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
  const { isMutationRunning, runBillingUpdateMutation } =
    useBillingUpdateMutation();

  const [switchSubscriptionIntervalMutation] = useMutation(
    SwitchSubscriptionIntervalDocument,
  );

  const getSuccessMessage = () => {
    if (isMonthlyPlan) {
      return t`Subscription has been switched to Yearly.`;
    }

    return subscriptionStatus === SubscriptionStatus.Trialing
      ? t`Subscription has been switched to Monthly.`
      : t`Subscription will be switched to Monthly the ${getBeautifiedRenewDate()}.`;
  };

  const switchBillingInterval = async () =>
    await runBillingUpdateMutation({
      errorMessage: t`Error while switching subscription.`,
      mutate: async () =>
        (await switchSubscriptionIntervalMutation()).data
          ?.switchSubscriptionInterval,
      successMessage: getSuccessMessage(),
    });

  return {
    isSwitchingInterval: isMutationRunning,
    switchBillingInterval,
  };
};
