import { useApplyCurrentWorkspaceBillingUpdate } from '@/settings/billing/hooks/useApplyCurrentWorkspaceBillingUpdate';
import { useBillingWording } from '@/settings/billing/hooks/useBillingWording';
import { useCurrentBillingFlags } from '@/settings/billing/hooks/useCurrentBillingFlags';
import { useGetResourceCreditUsage } from '@/settings/billing/hooks/useGetResourceCreditUsage';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useSubscriptionStatus } from '@/workspace/hooks/useSubscriptionStatus';
import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { useMutation } from '@apollo/client/react';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import {
  SubscriptionStatus,
  SwitchSubscriptionIntervalDocument,
} from '~/generated-metadata/graphql';

export const useSwitchBillingInterval = () => {
  const { t } = useLingui();
  const subscriptionStatus = useSubscriptionStatus();
  const { isMonthlyPlan } = useCurrentBillingFlags();
  const { enqueueSuccessSnackBar, enqueueErrorSnackBar } = useSnackBar();
  const { applyCurrentWorkspaceBillingUpdate } =
    useApplyCurrentWorkspaceBillingUpdate();
  const { refetchResourceCreditUsage } = useGetResourceCreditUsage();
  const { getBeautifiedRenewDate } = useBillingWording();

  const [switchSubscriptionIntervalMutation] = useMutation(
    SwitchSubscriptionIntervalDocument,
  );
  const [isSwitchingInterval, setIsSwitchingInterval] = useState(false);

  const getSuccessMessage = () => {
    if (isMonthlyPlan) {
      return t`Subscription has been switched to Yearly.`;
    }

    return subscriptionStatus === SubscriptionStatus.Trialing
      ? t`Subscription has been switched to Monthly.`
      : t`Subscription will be switched to Monthly the ${getBeautifiedRenewDate()}.`;
  };

  const switchBillingInterval = async () => {
    if (isSwitchingInterval) {
      return;
    }

    setIsSwitchingInterval(true);

    try {
      const successMessage = getSuccessMessage();
      const { data } = await switchSubscriptionIntervalMutation();
      const isBillingUpdateApplied = applyCurrentWorkspaceBillingUpdate(
        data?.switchSubscriptionInterval,
        { onBillingUpdateApplied: refetchResourceCreditUsage },
      );

      if (!isBillingUpdateApplied) {
        enqueueErrorSnackBar({
          message: t`Error while switching subscription.`,
        });
        return;
      }

      enqueueSuccessSnackBar({
        message: successMessage,
      });
    } catch (error) {
      enqueueErrorSnackBar({
        message: t`Error while switching subscription.`,
      });

      if (!CombinedGraphQLErrors.is(error)) {
        throw error;
      }
    } finally {
      setIsSwitchingInterval(false);
    }
  };

  return {
    isSwitchingInterval,
    switchBillingInterval,
  };
};
