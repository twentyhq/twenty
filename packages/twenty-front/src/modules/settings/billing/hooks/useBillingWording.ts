import { useDateTimeFormat } from '@/localization/hooks/useDateTimeFormat';
import { useFormatPrices } from '@/settings/billing/hooks/useFormatPrices';
import {
  BillingPlanKey,
  SubscriptionInterval,
} from '~/generated-metadata/graphql';
import {
  assertIsDefinedOrThrow,
  capitalize,
  isDefined,
} from 'twenty-shared/utils';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useLingui } from '@lingui/react/macro';
import { beautifyExactDate } from '~/utils/date-utils';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { getSubscriptionPlanKey } from '@/settings/billing/utils/getSubscriptionPlanKey';

export const useBillingWording = () => {
  const { calendarSystem } = useDateTimeFormat();
  const { t } = useLingui();

  const currentWorkspace = useAtomStateValue(currentWorkspaceState);

  assertIsDefinedOrThrow(currentWorkspace);

  const currentBillingSubscription =
    currentWorkspace.currentBillingSubscription;

  assertIsDefinedOrThrow(currentBillingSubscription);

  const { formatPrices } = useFormatPrices();

  const getIntervalLabel = (
    isMonthly: boolean,
    asAdjective: boolean = false,
  ): string =>
    isMonthly && asAdjective
      ? t`monthly`
      : asAdjective
        ? t`annual`
        : isMonthly
          ? t`month`
          : t`year`;

  const getBeautifiedRenewDate = () => {
    assertIsDefinedOrThrow(
      currentBillingSubscription.currentPeriodEnd,
      new Error(`No renew date defined for current subscription.`),
    );

    return beautifyExactDate(
      new Date(currentBillingSubscription.currentPeriodEnd),
      calendarSystem,
    );
  };

  const getBillingPlanLabel = (planKey: BillingPlanKey) =>
    planKey === BillingPlanKey.ENTERPRISE ? t`Organization` : t`Pro`;

  const getIntervalLabelAsAdjectiveCapitalize = (isMonthlyPlan: boolean) => {
    return capitalize(getIntervalLabel(isMonthlyPlan, true));
  };

  const currentPlanKey = getSubscriptionPlanKey(currentBillingSubscription);

  const yearlyPrice = isDefined(currentPlanKey)
    ? formatPrices[currentPlanKey]?.[SubscriptionInterval.Year]
    : undefined;

  const monthlyPrice = isDefined(currentPlanKey)
    ? formatPrices[currentPlanKey]?.[SubscriptionInterval.Month]
    : undefined;

  const getYearlyDiscountPercent = () =>
    isDefined(monthlyPrice) && isDefined(yearlyPrice) && monthlyPrice > 0
      ? Math.round((1 - yearlyPrice / monthlyPrice) * 100)
      : 0;

  return {
    getBeautifiedRenewDate,
    getBillingPlanLabel,
    getIntervalLabel,
    getIntervalLabelAsAdjectiveCapitalize,
    getYearlyDiscountPercent,
  };
};
