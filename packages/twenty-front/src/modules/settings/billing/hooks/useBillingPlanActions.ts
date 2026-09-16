import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { BILLING_MODAL_IDS } from '@/settings/billing/constants/BillingModalIds';
import { useBillingPortalSession } from '@/settings/billing/hooks/useBillingPortalSession';
import { useNextPlan } from '@/settings/billing/hooks/useNextPlan';
import { useSplitPhaseItemsInPrices } from '@/settings/billing/hooks/useSplitPhaseItemsInPrices';
import { isBillingUpdateRunningState } from '@/settings/billing/states/isBillingUpdateRunningState';
import { type SettingsBillingPlanAction } from '@/settings/billing/types/settingsBillingPlanAction.type';
import { type SettingsBillingPlanInterval } from '@/settings/billing/types/settingsBillingPlanComparison.type';
import { getBillingPlanActionType } from '@/settings/billing/utils/getBillingPlanActionType';
import { usePermissionFlagMap } from '@/settings/roles/hooks/usePermissionFlagMap';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { isSubscriptionPaymentOverdue } from '@/settings/billing/utils/isSubscriptionPaymentOverdue';
import { useSubscriptionStatus } from '@/workspace/hooks/useSubscriptionStatus';
import { useLingui } from '@lingui/react/macro';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import {
  IconArrowDown,
  IconArrowUp,
  IconCheck,
  IconCircleX,
  type IconComponent,
} from 'twenty-ui/icon';
import {
  BillingPlanKey,
  PermissionFlagType,
  SubscriptionInterval,
  SubscriptionStatus,
} from '~/generated-metadata/graphql';

type UseBillingPlanActionsParams = {
  currentPlanKey: BillingPlanKey;
  selectedInterval: SettingsBillingPlanInterval;
};

export const useBillingPlanActions = ({
  currentPlanKey,
  selectedInterval,
}: UseBillingPlanActionsParams) => {
  const { t } = useLingui();
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);
  const subscriptionStatus = useSubscriptionStatus();
  const { openModal } = useModal();
  const { nextPlan } = useNextPlan();
  const { splitedPhaseItemsInPrices } = useSplitPhaseItemsInPrices();
  const permissionMap = usePermissionFlagMap();

  const isBillingUpdateRunning = useAtomStateValue(isBillingUpdateRunningState);

  const { isBillingPortalSessionDisabled, openBillingPortal } =
    useBillingPortalSession(getSettingsPath(SettingsPath.BillingPlans));

  const currentBillingSubscription =
    currentWorkspace?.currentBillingSubscription;
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
    variant: 'secondary',
  });

  const createDisabledAction = (
    title: string,
    Icon?: IconComponent,
  ): SettingsBillingPlanAction => ({
    disabled: true,
    Icon,
    title,
    variant: 'secondary',
  });

  const createCancelAction = (
    modalId: string,
    title: string,
  ): SettingsBillingPlanAction => ({
    accent: 'blue',
    disabled: isBillingUpdateRunning,
    Icon: IconCircleX,
    isLoading: isBillingUpdateRunning,
    onClick: () => openModal(modalId),
    title,
    variant: 'primary',
  });

  const createSwitchAction = ({
    isUpgrade,
    modalId,
    title,
  }: {
    isUpgrade: boolean;
    modalId: string;
    title: string;
  }): SettingsBillingPlanAction => ({
    accent: isUpgrade ? 'blue' : 'default',
    disabled: isBillingUpdateRunning,
    Icon: isUpgrade ? IconArrowUp : IconArrowDown,
    isLoading: isBillingUpdateRunning,
    onClick: () => openModal(modalId),
    title,
    variant: isUpgrade ? 'primary' : 'secondary',
  });

  const getPlanAction = (
    planKey: BillingPlanKey,
  ): SettingsBillingPlanAction => {
    const actionType = getBillingPlanActionType({
      canSwitchSubscription,
      currentInterval: currentBillingSubscription?.interval,
      currentPlanKey,
      hasPermissionToManageBilling,
      isCancellationScheduled,
      isSubscriptionCanceled,
      planKey,
      scheduledInterval:
        splitedPhaseItemsInPrices.nextBasePrice?.recurringInterval,
      scheduledPlanKey: nextPlan?.planKey,
      selectedInterval,
      shouldUpdatePayment,
    });

    switch (actionType) {
      case 'MANAGE_BILLING':
        return createBillingPortalAction(t`Manage billing`);
      case 'UPDATE_PAYMENT':
        return createBillingPortalAction(t`Update payment`);
      case 'CURRENT':
        return createDisabledAction(t`Current`, IconCheck);
      case 'SCHEDULED':
        return createDisabledAction(t`Scheduled`);
      case 'UNAVAILABLE':
        return createDisabledAction(t`Unavailable`);
      case 'CONTACT_ADMIN':
        return createDisabledAction(t`Contact admin`);
      case 'SWITCH_INTERVAL_FIRST':
        return createDisabledAction(t`Switch interval first`);
      case 'CANCEL_PLAN_SWITCH':
        return createCancelAction(
          BILLING_MODAL_IDS.cancelSwitchBillingPlan,
          t`Cancel plan switching`,
        );
      case 'CANCEL_INTERVAL_SWITCH':
        return createCancelAction(
          BILLING_MODAL_IDS.cancelSwitchBillingInterval,
          t`Cancel interval switching`,
        );
      case 'SWITCH_INTERVAL': {
        const isUpgrade = selectedInterval === SubscriptionInterval.Year;

        return createSwitchAction({
          isUpgrade,
          modalId: isUpgrade
            ? BILLING_MODAL_IDS.switchBillingIntervalToYearly
            : BILLING_MODAL_IDS.switchBillingIntervalToMonthly,
          title: isUpgrade ? t`Upgrade to annual` : t`Downgrade to monthly`,
        });
      }
      case 'SWITCH_PLAN': {
        const isUpgrade = planKey === BillingPlanKey.ENTERPRISE;

        return createSwitchAction({
          isUpgrade,
          modalId: isUpgrade
            ? BILLING_MODAL_IDS.switchBillingPlanToEnterprise
            : BILLING_MODAL_IDS.switchBillingPlanToPro,
          title: isUpgrade ? t`Upgrade to Organization` : t`Downgrade to Pro`,
        });
      }
    }
  };

  return {
    planActions: {
      [BillingPlanKey.PRO]: getPlanAction(BillingPlanKey.PRO),
      [BillingPlanKey.ENTERPRISE]: getPlanAction(BillingPlanKey.ENTERPRISE),
    },
  };
};
