import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useBillingPortalSession } from '@/settings/billing/hooks/useBillingPortalSession';
import { useBillingWording } from '@/settings/billing/hooks/useBillingWording';
import { useNextInterval } from '@/settings/billing/hooks/useNextInterval';
import { useNextPlan } from '@/settings/billing/hooks/useNextPlan';
import { usePlanByPlanKey } from '@/settings/billing/hooks/usePlanByPlanKey';
import { type BillingSubscriptionChange } from '@/settings/billing/types/BillingSubscriptionChange';
import { type SettingsBillingComparedPlan } from '@/settings/billing/types/SettingsBillingComparedPlan';
import { type SettingsBillingPlanAction } from '@/settings/billing/types/SettingsBillingPlanAction';
import {
  type SettingsBillingComparedPlanKeys,
  type SettingsBillingPlanInterval,
} from '@/settings/billing/types/SettingsBillingPlanComparison';
import { getBillingPlanCell } from '@/settings/billing/utils/getBillingPlanCell';
import { isBillingSubscriptionChangeUpgrade } from '@/settings/billing/utils/isBillingSubscriptionChangeUpgrade';
import { isSubscriptionPaymentOverdue } from '@/settings/billing/utils/isSubscriptionPaymentOverdue';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSubscriptionStatus } from '@/workspace/hooks/useSubscriptionStatus';
import { useLingui } from '@lingui/react/macro';
import { SettingsPath } from 'twenty-shared/types';
import {
  assertUnreachable,
  getSettingsPath,
  isDefined,
  isNonEmptyArray,
} from 'twenty-shared/utils';
import {
  IconArrowDown,
  IconArrowUp,
  IconCheck,
  IconCircleX,
} from 'twenty-ui/icon';
import {
  type BillingPlanKey,
  PermissionFlagType,
  SubscriptionInterval,
  SubscriptionStatus,
} from '~/generated-metadata/graphql';

type UseBillingPlanActionsParams = {
  billingInterval: SettingsBillingPlanInterval;
  comparedPlanKeys: SettingsBillingComparedPlanKeys;
  currentPlanKey: BillingPlanKey;
  isApplyingBillingSubscriptionChange: boolean;
  onBillingSubscriptionChangeRequested: (
    change: BillingSubscriptionChange,
  ) => void;
};

export const useBillingPlanActions = ({
  billingInterval,
  comparedPlanKeys,
  currentPlanKey,
  isApplyingBillingSubscriptionChange,
  onBillingSubscriptionChangeRequested,
}: UseBillingPlanActionsParams) => {
  const { t } = useLingui();
  const { getBillingPlanLabel } = useBillingWording();
  const { getPlanByPlanKey } = usePlanByPlanKey();
  const currentPlan = getPlanByPlanKey(currentPlanKey);
  const canCurrentPlanSwitch =
    isNonEmptyArray(currentPlan.upgradePlanKeys) ||
    isNonEmptyArray(currentPlan.downgradePlanKeys);
  const displayedPlanKeys = comparedPlanKeys.includes(currentPlanKey)
    ? comparedPlanKeys
    : [currentPlanKey, ...comparedPlanKeys];
  const hasShortChangeTitles = displayedPlanKeys.length > 2;
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);
  const subscriptionStatus = useSubscriptionStatus();
  const { nextPlan } = useNextPlan();
  const { nextInterval } = useNextInterval();
  const hasPermissionToManageBilling = useHasPermissionFlag(
    PermissionFlagType.BILLING,
  );

  const { isBillingPortalSessionDisabled, openBillingPortal } =
    useBillingPortalSession(getSettingsPath(SettingsPath.BillingPlans));

  const currentBillingSubscription =
    currentWorkspace?.currentBillingSubscription;
  const currentInterval = currentBillingSubscription?.interval;

  const shouldUpdatePayment = isSubscriptionPaymentOverdue(subscriptionStatus);
  const isSubscriptionCanceled =
    currentBillingSubscription?.status === SubscriptionStatus.Canceled ||
    subscriptionStatus === SubscriptionStatus.Canceled;
  const isCancellationScheduled =
    currentBillingSubscription?.status !== SubscriptionStatus.Canceled &&
    isDefined(currentBillingSubscription?.cancelAt);
  const canSwitchSubscription =
    isDefined(currentBillingSubscription) &&
    !shouldUpdatePayment &&
    !isSubscriptionCanceled &&
    !isCancellationScheduled &&
    hasPermissionToManageBilling;

  const createBillingPortalAction = (
    title: string,
  ): SettingsBillingPlanAction => ({
    disabled: isBillingPortalSessionDisabled,
    onClick: openBillingPortal,
    title,
    variant: 'outline',
  });

  const getSwitchPlanTitle = ({
    isUpgrade,
    targetPlanKey,
  }: {
    isUpgrade: boolean;
    targetPlanKey: BillingPlanKey;
  }) => {
    const planLabel = getBillingPlanLabel(targetPlanKey);

    if (planLabel === getBillingPlanLabel(currentPlanKey)) {
      return t`Move to the new ${planLabel} plan`;
    }

    return isUpgrade ? t`Upgrade to ${planLabel}` : t`Switch to ${planLabel}`;
  };

  const getChangeTitle = ({
    change,
    isUpgrade,
  }: {
    change: BillingSubscriptionChange;
    isUpgrade: boolean;
  }) => {
    if (hasShortChangeTitles) {
      if (
        change.type === 'CANCEL_PLAN_SWITCH' ||
        change.type === 'CANCEL_INTERVAL_SWITCH'
      ) {
        return t`Cancel switch`;
      }

      return isUpgrade ? t`Upgrade` : t`Switch`;
    }

    switch (change.type) {
      case 'SWITCH_PLAN':
        return getSwitchPlanTitle({
          isUpgrade,
          targetPlanKey: change.targetPlanKey,
        });
      case 'SWITCH_INTERVAL':
        return change.targetInterval === SubscriptionInterval.Year
          ? t`Upgrade to annual`
          : t`Switch to monthly`;
      case 'CANCEL_PLAN_SWITCH':
        return t`Cancel plan switching`;
      case 'CANCEL_INTERVAL_SWITCH':
        return t`Cancel interval switching`;
      default:
        return assertUnreachable(change);
    }
  };

  const getChangeIcon = ({
    change,
    isUpgrade,
  }: {
    change: BillingSubscriptionChange;
    isUpgrade: boolean;
  }) => {
    if (
      change.type === 'CANCEL_PLAN_SWITCH' ||
      change.type === 'CANCEL_INTERVAL_SWITCH'
    ) {
      return IconCircleX;
    }

    return isUpgrade ? IconArrowUp : IconArrowDown;
  };

  const createChangeAction = ({
    change,
    isUpgrade,
  }: {
    change: BillingSubscriptionChange;
    isUpgrade: boolean;
  }): SettingsBillingPlanAction => ({
    color: isUpgrade ? 'accent' : 'neutral',
    disabled: isApplyingBillingSubscriptionChange,
    Icon: getChangeIcon({ change, isUpgrade }),
    isLoading: isApplyingBillingSubscriptionChange,
    onClick: () => onBillingSubscriptionChangeRequested(change),
    title: getChangeTitle({ change, isUpgrade }),
    variant: isUpgrade ? 'solid' : 'outline',
  });

  const getPlanAction = (
    planKey: BillingPlanKey,
  ): SettingsBillingPlanAction => {
    if (isSubscriptionCanceled || !isDefined(currentInterval)) {
      return createBillingPortalAction(t`Manage billing`);
    }

    const upcomingInterval = nextInterval ?? currentInterval;
    const upcomingPlanKey = nextPlan?.planKey ?? currentPlanKey;
    const cell = getBillingPlanCell({
      currentInterval,
      currentPlanKey,
      interval: billingInterval,
      planKey,
      upcomingInterval,
      upcomingPlanKey,
    });

    if (cell.kind === 'current') {
      return {
        disabled: true,
        Icon: IconCheck,
        title: t`Current`,
        variant: 'outline',
      };
    }

    if (cell.kind === 'scheduled') {
      return {
        disabled: true,
        title: t`Scheduled`,
        variant: 'outline',
      };
    }

    const isPlanSwitchUnavailable =
      cell.change.type === 'SWITCH_PLAN' &&
      !currentPlan.upgradePlanKeys.includes(planKey) &&
      !currentPlan.downgradePlanKeys.includes(planKey);
    const isLegacyIntervalSwitchDeferred =
      cell.change.type === 'SWITCH_INTERVAL' &&
      !getPlanByPlanKey(planKey).isSellable &&
      canCurrentPlanSwitch;

    if (isPlanSwitchUnavailable || isLegacyIntervalSwitchDeferred) {
      return {
        disabled: true,
        title: t`Unavailable`,
        variant: 'outline',
      };
    }

    if (shouldUpdatePayment) {
      return createBillingPortalAction(t`Update payment`);
    }

    if (isCancellationScheduled) {
      return createBillingPortalAction(t`Manage billing`);
    }

    if (!canSwitchSubscription) {
      return {
        disabled: true,
        title: hasPermissionToManageBilling ? t`Unavailable` : t`Contact admin`,
        variant: 'outline',
      };
    }

    return createChangeAction({
      change: cell.change,
      isUpgrade: isBillingSubscriptionChangeUpgrade({
        change: cell.change,
        currentPlan,
        upcomingInterval,
        upcomingPlanKey,
      }),
    });
  };

  const comparedPlans: SettingsBillingComparedPlan[] = displayedPlanKeys.map(
    (planKey) => ({
      action: getPlanAction(planKey),
      isLegacy: !getPlanByPlanKey(planKey).isSellable,
      planKey,
    }),
  );

  return { comparedPlans };
};
