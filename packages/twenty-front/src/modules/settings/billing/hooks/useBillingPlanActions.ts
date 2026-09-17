import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useBillingPortalSession } from '@/settings/billing/hooks/useBillingPortalSession';
import { useNextInterval } from '@/settings/billing/hooks/useNextInterval';
import { useNextPlan } from '@/settings/billing/hooks/useNextPlan';
import { type BillingSubscriptionChange } from '@/settings/billing/types/billingSubscriptionChange.type';
import { type SettingsBillingPlanAction } from '@/settings/billing/types/settingsBillingPlanAction.type';
import { type SettingsBillingPlanInterval } from '@/settings/billing/types/settingsBillingPlanComparison.type';
import { getBillingPlanCell } from '@/settings/billing/utils/getBillingPlanCell';
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

  const createChangeAction = (
    change: BillingSubscriptionChange,
  ): SettingsBillingPlanAction => {
    const action = {
      disabled: isApplyingBillingSubscriptionChange,
      isLoading: isApplyingBillingSubscriptionChange,
      onClick: () => onBillingSubscriptionChangeRequested(change),
    };
    const upgradeAction = {
      ...action,
      Icon: IconArrowUp,
      variant: 'solid',
      color: 'accent',
    } satisfies Partial<SettingsBillingPlanAction>;

    switch (change.type) {
      case 'SWITCH_PLAN':
        return change.targetPlanKey === BillingPlanKey.ENTERPRISE
          ? { ...upgradeAction, title: t`Upgrade to Organization` }
          : {
              ...action,
              Icon: IconArrowDown,
              title: t`Switch to Pro`,
              variant: 'outline',
            };
      case 'SWITCH_INTERVAL':
        return change.targetInterval === SubscriptionInterval.Year
          ? { ...upgradeAction, title: t`Upgrade to annual` }
          : {
              ...action,
              Icon: IconArrowDown,
              title: t`Switch to monthly`,
              variant: 'outline',
            };
      case 'CANCEL_PLAN_SWITCH':
        return {
          ...action,
          Icon: IconCircleX,
          title: t`Cancel plan switching`,
          variant: 'outline',
        };
      case 'CANCEL_INTERVAL_SWITCH':
        return {
          ...action,
          Icon: IconCircleX,
          title: t`Cancel interval switching`,
          variant: 'outline',
        };
    }
  };

  const getPlanAction = (
    planKey: BillingPlanKey,
  ): SettingsBillingPlanAction => {
    if (isSubscriptionCanceled || !isDefined(currentInterval)) {
      return createBillingPortalAction(t`Manage billing`);
    }

    const cell = getBillingPlanCell({
      currentInterval,
      currentPlanKey,
      interval: billingInterval,
      planKey,
      upcomingInterval: nextInterval ?? currentInterval,
      upcomingPlanKey: nextPlan?.planKey ?? currentPlanKey,
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

    return createChangeAction(cell.change);
  };

  return {
    planActions: {
      [BillingPlanKey.PRO]: getPlanAction(BillingPlanKey.PRO),
      [BillingPlanKey.ENTERPRISE]: getPlanAction(BillingPlanKey.ENTERPRISE),
    },
  };
};
