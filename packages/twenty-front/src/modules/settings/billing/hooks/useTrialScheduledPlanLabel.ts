import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { BILLING_PLAN_LABELS } from '@/settings/billing/constants/BillingPlanLabels';
import { useNextBillingPhase } from '@/settings/billing/hooks/useNextBillingPhase';
import { usePlans } from '@/settings/billing/hooks/usePlans';
import { getSubscriptionPlanKey } from '@/settings/billing/utils/getSubscriptionPlanKey';
import { isPriceInPlan } from '@/settings/billing/utils/isPriceInPlan';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { SubscriptionStatus } from '~/generated-metadata/graphql';

export const useTrialScheduledPlanLabel = () => {
  const { t } = useLingui();
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);
  const { nextBillingPhase } = useNextBillingPhase();

  const currentBillingSubscription =
    currentWorkspace?.currentBillingSubscription;
  const isTrialing =
    currentBillingSubscription?.status === SubscriptionStatus.Trialing;

  const { isPlansLoaded, listPlans } = usePlans({ skip: !isTrialing });

  if (!isTrialing || !isPlansLoaded || !isDefined(nextBillingPhase)) {
    return { trialScheduledPlanLabel: undefined };
  }

  const nextPlanKey = listPlans().find((plan) =>
    nextBillingPhase.items.some((item) =>
      isPriceInPlan({ plan, stripePriceId: item.price }),
    ),
  )?.planKey;

  const isPlanSwitchScheduled =
    isDefined(nextPlanKey) &&
    nextPlanKey !== getSubscriptionPlanKey(currentBillingSubscription);

  return {
    trialScheduledPlanLabel: isPlanSwitchScheduled
      ? t(BILLING_PLAN_LABELS[nextPlanKey])
      : undefined,
  };
};
