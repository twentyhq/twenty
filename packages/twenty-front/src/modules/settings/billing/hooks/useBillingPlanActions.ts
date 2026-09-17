import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useBillingPortalSession } from '@/settings/billing/hooks/useBillingPortalSession';
import { useNextInterval } from '@/settings/billing/hooks/useNextInterval';
import { useNextPlan } from '@/settings/billing/hooks/useNextPlan';
import { type BillingSubscriptionChange } from '@/settings/billing/types/billingSubscriptionChange.type';
import { type SettingsBillingPlanAction } from '@/settings/billing/types/settingsBillingPlanAction.type';
import { type SettingsBillingPlanInterval } from '@/settings/billing/types/settingsBillingPlanComparison.type';
import { getBillingPlanCell } from '@/settings/billing/utils/getBillingPlanCell';
import { isBillingSubscriptionChangeUpgrade } from '@/settings/billing/utils/isBillingSubscriptionChangeUpgrade';
import { isSubscriptionPaymentOverdue } from '@/settings/billing/utils/isSubscriptionPaymentOverdue';
import { usePermissionFlagMap } from '@/settings/roles/hooks/usePermissionFlagMap';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSubscriptionStatus } from '@/workspace/hooks/useSubscriptionStatus';
import { useLingui } from '@lingui/react/macro';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import {
  IconArrowDown,
  IconArrowUp,
  IconCheck,
  IconCircleX,
} from 'twenty-ui/icon';
import {
  BillingPlanKey,
  PermissionFlagType,
  SubscriptionInterval,
  SubscriptionStatus,
} from '~/generated-metadata/graphql';

type UseBillingPlanActionsParams = {
  billingInterval: SettingsBillingPlanInterval;
  currentPlanKey: BillingPlanKey;
  isApplyingBillingSubscriptionChange: boolean;
  onBillingSubscriptionChangeRequested: (
    change: BillingSubscriptionChange,
  ) => void;
};

export const useBillingPlanActions = ({
  billingInterval,
  currentPlanKey,
  isApplyingBillingSubscriptionChange,
  onBillingSubscriptionChangeRequested,
}: UseBillingPlanActionsParams) => {
  const { t } = useLingui();
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);
  const subscriptionStatus = useSubscriptionStatus();
  const { nextPlan } = useNextPlan();
  const { nextInterval } = useNextInterval();
  const permissionMap = usePermissionFlagMap();

  const { isBillingPortalSessionDisabled, openBillingPortal } =
    useBillingPortalSession(getSettingsPath(SettingsPath.BillingPlans));

  const currentBillingSubscription =
    currentWorkspace?.currentBillingSubscription;
  const currentInterval = currentBillingSubscription?.interval;
  const hasPermissionToManageBilling =
    permissionMap[PermissionFlagType.BILLING] ?? false;

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

  const getChangeTitle = (change: BillingSubscriptionChange) => {
    switch (change.type) {
      case 'SWITCH_PLAN':
        return change.targetPlanKey === BillingPlanKey.ENTERPRISE
          ? t`Upgrade to Organization`
          : t`Switch to Pro`;
      case 'SWITCH_INTERVAL':
        return change.targetInterval === SubscriptionInterval.Year
          ? t`Upgrade to annual`
          : t`Switch to monthly`;
      case 'CANCEL_PLAN_SWITCH':
        return t`Cancel plan switching`;
      case 'CANCEL_INTERVAL_SWITCH':
        return t`Cancel interval switching`;
    }
  };

  const createChangeAction = (
    change: BillingSubscriptionChange,
    isUpgrade: boolean,
  ): SettingsBillingPlanAction => ({
    color: isUpgrade ? 'accent' : 'neutral',
    disabled: isApplyingBillingSubscriptionChange,
    Icon:
      change.type === 'SWITCH_PLAN' || change.type === 'SWITCH_INTERVAL'
        ? isUpgrade
          ? IconArrowUp
          : IconArrowDown
        : IconCircleX,
    isLoading: isApplyingBillingSubscriptionChange,
    onClick: () => onBillingSubscriptionChangeRequested(change),
    title: getChangeTitle(change),
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

    return createChangeAction(
      cell.change,
      isBillingSubscriptionChangeUpgrade(cell.change, {
        upcomingInterval,
        upcomingPlanKey,
      }),
    );
  };

  return {
    planActions: {
      [BillingPlanKey.PRO]: getPlanAction(BillingPlanKey.PRO),
      [BillingPlanKey.ENTERPRISE]: getPlanAction(BillingPlanKey.ENTERPRISE),
    },
  };
};
