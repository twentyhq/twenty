import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useApplyCurrentWorkspaceBillingUpdate } from '@/settings/billing/hooks/useApplyCurrentWorkspaceBillingUpdate';
import { useBillingWording } from '@/settings/billing/hooks/useBillingWording';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSubscriptionStatus } from '@/workspace/hooks/useSubscriptionStatus';
import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { useMutation } from '@apollo/client/react';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import {
  BillingPlanKey,
  SubscriptionInterval,
  SubscriptionStatus,
  SwitchBillingPlanDocument,
} from '~/generated-metadata/graphql';

type SwitchBillingPlanParams = {
  targetInterval: SubscriptionInterval;
  targetPlanKey: BillingPlanKey;
};

export const useSwitchBillingPlan = () => {
  const { t } = useLingui();
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);
  const currentBillingSubscription =
    currentWorkspace?.currentBillingSubscription;
  const subscriptionStatus = useSubscriptionStatus();
  const { enqueueSuccessSnackBar, enqueueErrorSnackBar } = useSnackBar();
  const { applyCurrentWorkspaceBillingUpdate } =
    useApplyCurrentWorkspaceBillingUpdate();
  const { getBeautifiedRenewDate } = useBillingWording();

  const [switchBillingPlanMutation] = useMutation(SwitchBillingPlanDocument);
  const [isSwitchingPlan, setIsSwitchingPlan] = useState(false);

  const getTargetPlanLabel = (targetPlanKey: BillingPlanKey) =>
    targetPlanKey === BillingPlanKey.ENTERPRISE ? t`Organization` : t`Pro`;

  const getCurrentPlanKey = () => {
    const currentPlanKey = currentBillingSubscription?.metadata?.['plan'];

    if (
      currentPlanKey === BillingPlanKey.ENTERPRISE ||
      currentPlanKey === BillingPlanKey.PRO
    ) {
      return currentPlanKey;
    }

    return undefined;
  };

  const shouldSwitchAtPeriodEnd = ({
    targetInterval,
    targetPlanKey,
  }: SwitchBillingPlanParams) => {
    if (subscriptionStatus === SubscriptionStatus.Trialing) {
      return false;
    }

    const currentPlanKey = getCurrentPlanKey();
    const hasPlanChange =
      isDefined(currentPlanKey) && currentPlanKey !== targetPlanKey;
    const isPlanDowngrade =
      hasPlanChange && targetPlanKey === BillingPlanKey.PRO;
    const isPlanUpgrade =
      hasPlanChange && targetPlanKey === BillingPlanKey.ENTERPRISE;
    const currentInterval = currentBillingSubscription?.interval;
    const isIntervalDowngrade =
      isDefined(currentInterval) &&
      currentInterval !== targetInterval &&
      targetInterval === SubscriptionInterval.Month;

    return isPlanDowngrade || (isIntervalDowngrade && !isPlanUpgrade);
  };

  const getSuccessMessage = (params: SwitchBillingPlanParams) =>
    shouldSwitchAtPeriodEnd(params)
      ? t`Subscription will be switched to ${getTargetPlanLabel(params.targetPlanKey)} Plan the ${getBeautifiedRenewDate()}.`
      : t`Subscription has been switched to ${getTargetPlanLabel(params.targetPlanKey)} Plan.`;

  const switchBillingPlan = async ({
    targetInterval,
    targetPlanKey,
  }: SwitchBillingPlanParams) => {
    if (isSwitchingPlan) {
      return;
    }

    setIsSwitchingPlan(true);

    try {
      const { data } = await switchBillingPlanMutation({
        variables: {
          targetInterval,
          targetPlanKey,
        },
      });
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
        message: getSuccessMessage({ targetInterval, targetPlanKey }),
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
