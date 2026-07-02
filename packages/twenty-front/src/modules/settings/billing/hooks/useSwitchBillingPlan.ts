import { useApplyCurrentWorkspaceBillingUpdate } from '@/settings/billing/hooks/useApplyCurrentWorkspaceBillingUpdate';
import { useBillingWording } from '@/settings/billing/hooks/useBillingWording';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useSubscriptionStatus } from '@/workspace/hooks/useSubscriptionStatus';
import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { useMutation } from '@apollo/client/react';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import {
  BillingPlanKey,
  SubscriptionStatus,
  SwitchBillingPlanDocument,
} from '~/generated-metadata/graphql';

export const useSwitchBillingPlan = () => {
  const { t } = useLingui();
  const subscriptionStatus = useSubscriptionStatus();
  const { enqueueSuccessSnackBar, enqueueErrorSnackBar } = useSnackBar();
  const { applyCurrentWorkspaceBillingUpdate } =
    useApplyCurrentWorkspaceBillingUpdate();
  const { getBeautifiedRenewDate } = useBillingWording();

  const [switchBillingPlanMutation] = useMutation(SwitchBillingPlanDocument);
  const [isSwitchingPlan, setIsSwitchingPlan] = useState(false);

  const getTargetPlanLabel = (targetPlanKey: BillingPlanKey) =>
    targetPlanKey === BillingPlanKey.ENTERPRISE ? t`Organization` : t`Pro`;

  const getSuccessMessage = (targetPlanKey: BillingPlanKey) =>
    targetPlanKey === BillingPlanKey.ENTERPRISE ||
    subscriptionStatus === SubscriptionStatus.Trialing
      ? t`Subscription has been switched to ${getTargetPlanLabel(targetPlanKey)} Plan.`
      : t`Subscription will be switched to ${getTargetPlanLabel(targetPlanKey)} Plan the ${getBeautifiedRenewDate()}.`;

  const switchBillingPlan = async (targetPlanKey: BillingPlanKey) => {
    if (isSwitchingPlan) {
      return;
    }

    setIsSwitchingPlan(true);

    try {
      const { data } = await switchBillingPlanMutation();
      const isBillingUpdateApplied = applyCurrentWorkspaceBillingUpdate(
        data?.switchBillingPlan,
      );

      if (!isBillingUpdateApplied) {
        enqueueErrorSnackBar({
          message: t`Error while switching subscription.`,
        });
        return;
      }

      enqueueSuccessSnackBar({
        message: getSuccessMessage(targetPlanKey),
      });
    } catch (error) {
      enqueueErrorSnackBar({
        message: t`Error while switching subscription.`,
      });

      if (!CombinedGraphQLErrors.is(error)) {
        throw error;
      }
    } finally {
      setIsSwitchingPlan(false);
    }
  };

  return {
    isSwitchingPlan,
    switchBillingPlan,
  };
};
