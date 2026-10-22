import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { BILLING_PLAN_LABELS } from '@/settings/billing/constants/BillingPlanLabels';
import { usePlans } from '@/settings/billing/hooks/usePlans';
import { findNextBillingPhase } from '@/settings/billing/utils/findNextBillingPhase';
import { getSubscriptionPlanKey } from '@/settings/billing/utils/getSubscriptionPlanKey';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { SubscriptionStatus } from '~/generated-metadata/graphql';

// Rendered outside the billing page, where plans may still be loading
export const useTrialScheduledPlanLabel = () => {
  const { t } = useLingui();
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);

  const currentBillingSubscription =
    currentWorkspace?.currentBillingSubscription;
  const isTrialing =
    currentBillingSubscription?.status === SubscriptionStatus.Trialing;

  const { isPlansLoaded, listPlans } = usePlans({ skip: !isTrialing });

  const nextBillingPhase = findNextBillingPhase(
    currentBillingSubscription?.phases ?? [],
    Date.now(),
  );

  if (!isTrialing || !isPlansLoaded || !isDefined(nextBillingPhase)) {
    return { trialScheduledPlanLabel: undefined };
  }

  const nextPhasePriceIds = nextBillingPhase.items.map((item) => item.price);

  const nextPlanKey = listPlans().find((plan) =>
    plan.baseProducts.some((product) =>
      product.prices?.some((price) =>
        nextPhasePriceIds.includes(price.stripePriceId),
      ),
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
