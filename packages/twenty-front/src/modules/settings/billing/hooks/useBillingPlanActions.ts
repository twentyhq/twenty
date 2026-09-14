import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { BILLING_MODAL_IDS } from '@/settings/billing/constants/BillingModalIds';
import { useBillingPortalSession } from '@/settings/billing/hooks/useBillingPortalSession';
import { useNextPlan } from '@/settings/billing/hooks/useNextPlan';
import { useSplitPhaseItemsInPrices } from '@/settings/billing/hooks/useSplitPhaseItemsInPrices';
import { useSwitchBillingInterval } from '@/settings/billing/hooks/useSwitchBillingInterval';
import { useSwitchBillingPlan } from '@/settings/billing/hooks/useSwitchBillingPlan';
import { type SettingsBillingPlanAction } from '@/settings/billing/types/settingsBillingPlanAction.type';
import { type SettingsBillingPlanInterval } from '@/settings/billing/types/settingsBillingPlanComparison.type';
import { usePermissionFlagMap } from '@/settings/roles/hooks/usePermissionFlagMap';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { isSubscriptionPaymentOverdue } from '@/settings/billing/utils/isSubscriptionPaymentOverdue';
import { useSubscriptionStatus } from '@/workspace/hooks/useSubscriptionStatus';
import { useLingui } from '@lingui/react/macro';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import { IconArrowDown, IconArrowUp, IconCheck } from 'twenty-ui/icon';
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

  const { isSwitchingPlan, switchBillingPlan } = useSwitchBillingPlan();
  const { isSwitchingInterval, switchBillingInterval } =
    useSwitchBillingInterval();

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

  const isSelectedIntervalCurrent =
    selectedInterval === currentBillingSubscription?.interval;
  const nextInterval =
    splitedPhaseItemsInPrices.nextBasePrice?.recurringInterval;

  const createBillingPortalAction = (
    title: string,
  ): SettingsBillingPlanAction => ({
    disabled: isBillingPortalSessionDisabled,
    onClick: openBillingPortal,
    title,
    variant: 'secondary',
  });

  const getPlanAction = (
    planKey: BillingPlanKey,
  ): SettingsBillingPlanAction => {
    if (isSubscriptionCanceled) {
      return createBillingPortalAction(t`Manage billing`);
    }

    const isCurrentPlan = currentPlanKey === planKey;
    const isIntervalSwitch = isCurrentPlan && !isSelectedIntervalCurrent;

    if (isCurrentPlan && isSelectedIntervalCurrent) {
      return {
        disabled: true,
        Icon: IconCheck,
        title: t`Current`,
        variant: 'secondary',
      };
    }

    const isScheduled = isIntervalSwitch
      ? selectedInterval === nextInterval
      : nextPlan?.planKey === planKey;

    if (isScheduled) {
      return {
        disabled: true,
        title: t`Scheduled`,
        variant: 'secondary',
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
        variant: 'secondary',
      };
    }

    if (isIntervalSwitch) {
      const isSwitchingToAnnual =
        selectedInterval === SubscriptionInterval.Year;

      return {
        disabled: isSwitchingInterval,
        Icon: isSwitchingToAnnual ? IconArrowUp : IconArrowDown,
        isLoading: isSwitchingInterval,
        onClick: () =>
          openModal(
            isSwitchingToAnnual
              ? BILLING_MODAL_IDS.switchBillingIntervalToYearly
              : BILLING_MODAL_IDS.switchBillingIntervalToMonthly,
          ),
        title: isSwitchingToAnnual ? t`Switch to annual` : t`Switch to monthly`,
        variant: 'secondary',
      };
    }

    const isSwitchingToOrganizationPlan = planKey === BillingPlanKey.ENTERPRISE;

    return {
      disabled: isSwitchingPlan,
      Icon: isSwitchingToOrganizationPlan ? IconArrowUp : IconArrowDown,
      isLoading: isSwitchingPlan,
      onClick: () =>
        openModal(
          isSwitchingToOrganizationPlan
            ? BILLING_MODAL_IDS.switchBillingPlanToEnterprise
            : BILLING_MODAL_IDS.switchBillingPlanToPro,
        ),
      title: isSwitchingToOrganizationPlan ? t`Upgrade` : t`Switch to Pro`,
      variant: isSwitchingToOrganizationPlan ? 'primary' : 'secondary',
      accent: isSwitchingToOrganizationPlan ? 'blue' : 'default',
    };
  };

  return {
    isSwitchingInterval,
    isSwitchingPlan,
    planActions: {
      [BillingPlanKey.PRO]: getPlanAction(BillingPlanKey.PRO),
      [BillingPlanKey.ENTERPRISE]: getPlanAction(BillingPlanKey.ENTERPRISE),
    },
    switchBillingInterval,
    switchBillingPlan,
  };
};
