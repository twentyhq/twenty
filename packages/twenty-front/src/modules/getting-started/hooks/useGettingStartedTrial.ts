import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { getGettingStartedTrialCountdown } from '@/getting-started/utils/getGettingStartedTrialCountdown';
import { useDateTimeFormat } from '@/localization/hooks/useDateTimeFormat';
import { dateLocaleState } from '@/localization/states/dateLocaleState';
import { formatDateISOStringToCustomUnicodeFormat } from '@/localization/utils/formatDateISOStringToCustomUnicodeFormat';
import { BILLING_PLAN_LABELS } from '@/settings/billing/constants/BillingPlanLabels';
import { billingHasPaymentMethodSelector } from '@/settings/billing/states/billingHasPaymentMethodSelector';
import { getSubscriptionPlanKey } from '@/settings/billing/utils/getSubscriptionPlanKey';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSubscriptionStatus } from '@/workspace/hooks/useSubscriptionStatus';
import { useLingui } from '@lingui/react/macro';
import { doNotTranslate } from 'twenty-shared/i18n';
import { isDefined } from 'twenty-shared/utils';

import { PermissionFlagType } from '~/generated-metadata/graphql';

export const useGettingStartedTrial = () => {
  const { t } = useLingui();
  const subscriptionStatus = useSubscriptionStatus();
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);
  const billingHasPaymentMethod = useAtomStateValue(
    billingHasPaymentMethodSelector,
  );
  const hasBillingPermission = useHasPermissionFlag(PermissionFlagType.BILLING);
  const { timeZone } = useDateTimeFormat();
  const { localeCatalog } = useAtomStateValue(dateLocaleState);

  const currentBillingSubscription =
    currentWorkspace?.currentBillingSubscription;
  const { trialEnd, isCountdownVisible, daysLeft } =
    getGettingStartedTrialCountdown({
      subscriptionStatus,
      currentPeriodEnd: currentBillingSubscription?.currentPeriodEnd,
      hasPaymentMethod: billingHasPaymentMethod,
      now: new Date(),
    });

  const planKey = getSubscriptionPlanKey(currentBillingSubscription);
  const planLabel = isDefined(planKey)
    ? t(BILLING_PLAN_LABELS[planKey])
    : undefined;

  return {
    formattedTrialEnd:
      isCountdownVisible && isDefined(trialEnd)
        ? formatDateISOStringToCustomUnicodeFormat({
            date: trialEnd.toISOString(),
            timeZone,
            dateFormat: doNotTranslate('EEE, MMM d'),
            localeCatalog,
          })
        : undefined,
    planLabel,
    daysLeft,
    isCountdownVisible,
    canKeepPlan: isCountdownVisible && hasBillingPermission,
  };
};
