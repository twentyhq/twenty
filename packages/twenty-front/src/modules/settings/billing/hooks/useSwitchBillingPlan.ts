import { useApplyCurrentWorkspaceBillingUpdate } from '@/settings/billing/hooks/useApplyCurrentWorkspaceBillingUpdate';
import { useBillingWording } from '@/settings/billing/hooks/useBillingWording';
import { usePlanByPriceId } from '@/settings/billing/hooks/usePlanByPriceId';
import { usePriceAndBillingUsageByPriceId } from '@/settings/billing/hooks/usePriceAndBillingUsageByPriceId';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { useMutation } from '@apollo/client/react';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import {
  BillingPlanKey,
  BillingUsageType,
  SwitchBillingPlanDocument,
  type SubscriptionInterval,
  type SwitchBillingPlanMutation,
} from '~/generated-metadata/graphql';

type SwitchBillingPlanParams = {
  targetInterval: SubscriptionInterval;
  targetPlanKey: BillingPlanKey;
};

type CurrentBillingSubscription =
  SwitchBillingPlanMutation['switchBillingPlan']['currentBillingSubscription'];

type SwitchBillingPlanSuccessMessageParams = Pick<
  SwitchBillingPlanParams,
  'targetPlanKey'
> & {
  isSwitchScheduledAtPeriodEnd: boolean;
};

export const useSwitchBillingPlan = () => {
  const { t } = useLingui();
  const { enqueueSuccessSnackBar, enqueueErrorSnackBar } = useSnackBar();
  const { applyCurrentWorkspaceBillingUpdate } =
    useApplyCurrentWorkspaceBillingUpdate();
  const { getBeautifiedRenewDate } = useBillingWording();
  const { getPlanByPriceId } = usePlanByPriceId();
  const { getPriceAndBillingUsageByPriceId } =
    usePriceAndBillingUsageByPriceId();

  const [switchBillingPlanMutation] = useMutation(SwitchBillingPlanDocument);
  const [isSwitchingPlan, setIsSwitchingPlan] = useState(false);

  const getTargetPlanLabel = (targetPlanKey: BillingPlanKey) =>
    targetPlanKey === BillingPlanKey.ENTERPRISE ? t`Organization` : t`Pro`;

  const isTargetPlanAppliedToCurrentSubscription = ({
    currentBillingSubscription,
    targetInterval,
    targetPlanKey,
  }: SwitchBillingPlanParams & {
    currentBillingSubscription: CurrentBillingSubscription;
  }) =>
    currentBillingSubscription.interval === targetInterval &&
    currentBillingSubscription.billingSubscriptionItems?.some(
      (billingSubscriptionItem) =>
        billingSubscriptionItem.billingProduct.metadata.priceUsageBased ===
          BillingUsageType.LICENSED &&
        billingSubscriptionItem.billingProduct.metadata.planKey ===
          targetPlanKey,
    ) === true;

  const isTargetPlanInNextPhase = ({
    currentBillingSubscription,
    targetInterval,
    targetPlanKey,
  }: SwitchBillingPlanParams & {
    currentBillingSubscription: CurrentBillingSubscription;
  }) => {
    const nextPhase = currentBillingSubscription.phases[1];

    if (!isDefined(nextPhase)) {
      return false;
    }

    return nextPhase.items.some(({ price: stripePriceId }) => {
      try {
        const plan = getPlanByPriceId(stripePriceId);
        const { billingUsage, price } =
          getPriceAndBillingUsageByPriceId(stripePriceId);

        return (
          billingUsage === BillingUsageType.LICENSED &&
          !isDefined(price.creditAmount) &&
          price.recurringInterval === targetInterval &&
          plan.planKey === targetPlanKey
        );
      } catch {
        return false;
      }
    });
  };

  const getIsSwitchScheduledAtPeriodEnd = (
    billingUpdate: SwitchBillingPlanMutation['switchBillingPlan'] | undefined,
    params: SwitchBillingPlanParams,
  ) => {
    const currentBillingSubscription =
      billingUpdate?.currentBillingSubscription;

    if (!isDefined(currentBillingSubscription)) {
      return false;
    }

    if (
      isTargetPlanAppliedToCurrentSubscription({
        currentBillingSubscription,
        ...params,
      })
    ) {
      return false;
    }

    return isTargetPlanInNextPhase({
      currentBillingSubscription,
      ...params,
    });
  };

  const getSuccessMessage = ({
    isSwitchScheduledAtPeriodEnd,
    targetPlanKey,
  }: SwitchBillingPlanSuccessMessageParams) =>
    isSwitchScheduledAtPeriodEnd
      ? t`Subscription will be switched to ${getTargetPlanLabel(targetPlanKey)} Plan the ${getBeautifiedRenewDate()}.`
      : t`Subscription has been switched to ${getTargetPlanLabel(targetPlanKey)} Plan.`;

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

      const isSwitchScheduledAtPeriodEnd = getIsSwitchScheduledAtPeriodEnd(
        data?.switchBillingPlan,
        { targetInterval, targetPlanKey },
      );

      enqueueSuccessSnackBar({
        message: getSuccessMessage({
          isSwitchScheduledAtPeriodEnd,
          targetPlanKey,
        }),
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
