import { useApplyCurrentWorkspaceBillingUpdate } from '@/settings/billing/hooks/useApplyCurrentWorkspaceBillingUpdate';
import { useBillingWording } from '@/settings/billing/hooks/useBillingWording';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useSubscriptionStatus } from '@/workspace/hooks/useSubscriptionStatus';
import { useMutation } from '@apollo/client/react';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import {
  BillingPlanKey,
  SubscriptionStatus,
  SwitchBillingPlanDocument,
} from '~/generated-metadata/graphql';

type UseSwitchBillingPlanOptions = {
  getErrorMessage?: (targetPlanKey: BillingPlanKey) => string;
  isActionBlocked?: boolean;
  onBillingUpdateApplied?: () => void;
  targetPlanKey: BillingPlanKey;
};

export const useSwitchBillingPlan = ({
  getErrorMessage,
  isActionBlocked = false,
  onBillingUpdateApplied,
  targetPlanKey,
}: UseSwitchBillingPlanOptions) => {
  const { t } = useLingui();
  const subscriptionStatus = useSubscriptionStatus();
  const { enqueueSuccessSnackBar, enqueueErrorSnackBar } = useSnackBar();
  const { applyCurrentWorkspaceBillingUpdate } =
    useApplyCurrentWorkspaceBillingUpdate();
  const { getBeautifiedRenewDate } = useBillingWording();

  const [switchBillingPlanMutation] = useMutation(SwitchBillingPlanDocument);
  const [isSwitchingPlan, setIsSwitchingPlan] = useState(false);

  const getSuccessMessage = () =>
    targetPlanKey === BillingPlanKey.ENTERPRISE ||
    subscriptionStatus === SubscriptionStatus.Trialing
      ? t`Subscription has been switched to ${targetPlanKey} Plan.`
      : t`Subscription will be switched to ${targetPlanKey} Plan the ${getBeautifiedRenewDate()}.`;

  const switchBillingPlan = async () => {
    if (isActionBlocked || isSwitchingPlan) {
      return;
    }

    setIsSwitchingPlan(true);

    try {
      const { data } = await switchBillingPlanMutation();
      const isBillingUpdateApplied = applyCurrentWorkspaceBillingUpdate(
        data?.switchBillingPlan,
        {
          onBillingUpdateApplied,
        },
      );

      if (!isBillingUpdateApplied) {
        throw new Error('No billing update returned while switching plan.');
      }

      enqueueSuccessSnackBar({
        message: getSuccessMessage(),
      });
    } catch {
      enqueueErrorSnackBar({
        message:
          getErrorMessage?.(targetPlanKey) ??
          t`Error while switching subscription.`,
      });
    } finally {
      setIsSwitchingPlan(false);
    }
  };

  return {
    isSwitchingPlan,
    switchBillingPlan,
  };
};
