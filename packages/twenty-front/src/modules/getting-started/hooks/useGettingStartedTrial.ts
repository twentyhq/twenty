import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { BILLING_PLAN_LABELS } from '@/settings/billing/constants/BillingPlanLabels';
import { billingHasPaymentMethodSelector } from '@/settings/billing/states/billingHasPaymentMethodSelector';
import { getSubscriptionPlanKey } from '@/settings/billing/utils/getSubscriptionPlanKey';
import { permissionFlagMapSelector } from '@/settings/roles/states/permissionFlagMapSelector';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSubscriptionStatus } from '@/workspace/hooks/useSubscriptionStatus';
import { useLingui } from '@lingui/react/macro';
import { differenceInCalendarDays } from 'date-fns';
import { isDefined } from 'twenty-shared/utils';

import {
  PermissionFlagType,
  SubscriptionStatus,
} from '~/generated-metadata/graphql';

export const useGettingStartedTrial = () => {
  const { t } = useLingui();
  const subscriptionStatus = useSubscriptionStatus();
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);
  const billingHasPaymentMethod = useAtomStateValue(
    billingHasPaymentMethodSelector,
  );
  const permissionFlagMap = useAtomStateValue(permissionFlagMapSelector);

  const currentBillingSubscription =
    currentWorkspace?.currentBillingSubscription;
  const trialEnd =
    subscriptionStatus === SubscriptionStatus.Trialing &&
    isDefined(currentBillingSubscription?.currentPeriodEnd)
      ? new Date(currentBillingSubscription.currentPeriodEnd)
      : null;
  const isCountdownVisible =
    isDefined(trialEnd) && billingHasPaymentMethod === false;

  const planKey = getSubscriptionPlanKey(currentBillingSubscription);
  const planLabel = isDefined(planKey)
    ? t(BILLING_PLAN_LABELS[planKey])
    : undefined;

  return {
    trialEnd,
    daysLeft: isDefined(trialEnd)
      ? Math.max(0, differenceInCalendarDays(trialEnd, new Date()))
      : 0,
    isCountdownVisible,
    canKeepPlan:
      isCountdownVisible && permissionFlagMap[PermissionFlagType.WORKSPACE],
    keepPlanLabel: isDefined(planLabel)
      ? t`Keep ${planLabel}`
      : t`Keep your plan`,
  };
};
