import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { BILLING_MODAL_IDS } from '@/settings/billing/constants/BillingModalIds';
import { useBillingPortalSession } from '@/settings/billing/hooks/useBillingPortalSession';
import { useNextPlan } from '@/settings/billing/hooks/useNextPlan';
import { useSwitchBillingPlan } from '@/settings/billing/hooks/useSwitchBillingPlan';
import { type SettingsBillingPlanAction } from '@/settings/billing/types/settingsBillingPlanAction.type';
import { usePermissionFlagMap } from '@/settings/roles/hooks/usePermissionFlagMap';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSubscriptionStatus } from '@/workspace/hooks/useSubscriptionStatus';
import { useLingui } from '@lingui/react/macro';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import { IconArrowDown, IconArrowUp, IconCheck } from 'twenty-ui/icon';
import {
  BillingPlanKey,
  PermissionFlagType,
  SubscriptionStatus,
} from '~/generated-metadata/graphql';

type UseBillingPlanActionsParams = {
  currentPlanKey: BillingPlanKey;
};

export const useBillingPlanActions = ({
  currentPlanKey,
}: UseBillingPlanActionsParams) => {
  const { t } = useLingui();
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);
  const subscriptionStatus = useSubscriptionStatus();
  const { openModal } = useModal();
  const { nextPlan } = useNextPlan();
  const permissionMap = usePermissionFlagMap();

  const { isSwitchingPlan, switchBillingPlan } = useSwitchBillingPlan();

  const { isBillingPortalSessionDisabled, openBillingPortal } =
    useBillingPortalSession(getSettingsPath(SettingsPath.BillingPlans));

  const currentBillingSubscription =
    currentWorkspace?.currentBillingSubscription;
  const hasPermissionToManageBilling =
    permissionMap[PermissionFlagType.BILLING] ?? false;

  const shouldUpdatePayment =
    subscriptionStatus === SubscriptionStatus.PastDue ||
    subscriptionStatus === SubscriptionStatus.Unpaid;
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

  const getPlanAction = (
    planKey: BillingPlanKey,
  ): SettingsBillingPlanAction => {
    if (isSubscriptionCanceled) {
      return createBillingPortalAction(t`Manage billing`);
    }

    if (currentPlanKey === planKey) {
      return {
        disabled: true,
        Icon: IconCheck,
        title: t`Current`,
        variant: 'secondary',
      };
    }

    if (nextPlan?.planKey === planKey) {
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
    isSwitchingPlan,
    planActions: {
      [BillingPlanKey.PRO]: getPlanAction(BillingPlanKey.PRO),
      [BillingPlanKey.ENTERPRISE]: getPlanAction(BillingPlanKey.ENTERPRISE),
    },
    switchBillingPlan,
  };
};
