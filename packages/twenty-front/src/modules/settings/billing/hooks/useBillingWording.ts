import { useFormatPrices } from '@/settings/billing/hooks/useFormatPrices';
import {
  BillingPlanKey,
  SubscriptionInterval,
  SubscriptionStatus,
} from '~/generated-metadata/graphql';
import {
  assertIsDefinedOrThrow,
  capitalize,
  isDefined,
} from 'twenty-shared/utils';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useSubscriptionStatus } from '@/workspace/hooks/useSubscriptionStatus';
import { useLingui } from '@lingui/react/macro';
import { beautifyExactDate } from '~/utils/date-utils';
import { useCurrentPlan } from '@/settings/billing/hooks/useCurrentPlan';
import { useNextPlan } from '@/settings/billing/hooks/useNextPlan';
import { useSplitPhaseItemsInPrices } from '@/settings/billing/hooks/useSplitPhaseItemsInPrices';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { type SettingsBillingPlanInterval } from '@/settings/billing/types/settingsBillingPlanComparison.type';
import { getBillingStateAfterScheduledChange } from '@/settings/billing/utils/getBillingStateAfterScheduledChange';
import { getSubscriptionPlanKey } from '@/settings/billing/utils/getSubscriptionPlanKey';
import { getSwitchBillingIntervalConfirmationMessage } from '@/settings/billing/utils/getSwitchBillingIntervalConfirmationMessage';
import { getSwitchBillingPlanConfirmationMessage } from '@/settings/billing/utils/getSwitchBillingPlanConfirmationMessage';

export const useBillingWording = () => {
  const { t } = useLingui();

  const currentWorkspace = useAtomStateValue(currentWorkspaceState);

  assertIsDefinedOrThrow(currentWorkspace);

  const currentBillingSubscription =
    currentWorkspace.currentBillingSubscription;

  assertIsDefinedOrThrow(currentBillingSubscription);

  const { formatPrices } = useFormatPrices();

  const { currentPlan } = useCurrentPlan();

  const subscriptionStatus = useSubscriptionStatus();

  const { nextPlan } = useNextPlan();
  const { splitedPhaseItemsInPrices } = useSplitPhaseItemsInPrices();

  const isTrialing = subscriptionStatus === SubscriptionStatus.Trialing;

  const getIntervalLabel = (
    isMonthly: boolean,
    asAdjective: boolean = false,
  ): string =>
    isMonthly && asAdjective
      ? t`monthly`
      : asAdjective
        ? t`yearly`
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
    );
  };

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

  const getCurrentIntervalLabel = () =>
    getIntervalLabelAsAdjectiveCapitalize(
      currentBillingSubscription.interval === SubscriptionInterval.Month,
    );

  const stateAfterScheduledChange = getBillingStateAfterScheduledChange({
    currentInterval: currentBillingSubscription.interval,
    currentPlanKey,
    scheduledInterval:
      splitedPhaseItemsInPrices.nextBasePrice?.recurringInterval,
    scheduledPlanKey: nextPlan?.planKey,
  });

  const targetPlanKeyAfterScheduledChange =
    stateAfterScheduledChange.planKey === BillingPlanKey.ENTERPRISE
      ? BillingPlanKey.ENTERPRISE
      : BillingPlanKey.PRO;
  const targetIntervalAfterScheduledChange =
    stateAfterScheduledChange.interval === SubscriptionInterval.Month
      ? SubscriptionInterval.Month
      : SubscriptionInterval.Year;

  const getSwitchIntervalMessage = (
    targetInterval: SettingsBillingPlanInterval,
  ) =>
    getSwitchBillingIntervalConfirmationMessage({
      getBeautifiedRenewDate,
      isTrialing,
      price: formatPrices[targetPlanKeyAfterScheduledChange][targetInterval],
      targetInterval,
      targetPlanKey: targetPlanKeyAfterScheduledChange,
    });

  const getSwitchPlanMessage = (targetPlanKey: BillingPlanKey) =>
    getSwitchBillingPlanConfirmationMessage({
      getBeautifiedRenewDate,
      isTrialing,
      price: formatPrices[targetPlanKey][targetIntervalAfterScheduledChange],
      targetInterval: targetIntervalAfterScheduledChange,
      targetPlanKey,
    });

  const confirmationModalSwitchToYearlyMessage = () =>
    getSwitchIntervalMessage(SubscriptionInterval.Year);

  const confirmationModalSwitchToMonthlyMessage = () =>
    getSwitchIntervalMessage(SubscriptionInterval.Month);

  const confirmationModalSwitchToOrganizationMessage = () =>
    getSwitchPlanMessage(BillingPlanKey.ENTERPRISE);

  const confirmationModalSwitchToProMessage = () =>
    getSwitchPlanMessage(BillingPlanKey.PRO);

  const confirmationModalCancelPlanSwitchingMessage = () => {
    const planKeyWord =
      currentPlan.planKey === BillingPlanKey.ENTERPRISE
        ? t`Organization`
        : t`Pro`;

    return t`This will cancel the scheduled plan change and keep your current plan (${planKeyWord}).`;
  };

  const confirmationModalCancelIntervalSwitchingMessage = () => {
    const currentIntervalLabel = getCurrentIntervalLabel();

    return t`This will cancel the scheduled interval change and keep your current billing interval (${currentIntervalLabel}).`;
  };

  return {
    getBeautifiedRenewDate,
    getIntervalLabel,
    getIntervalLabelAsAdjectiveCapitalize,
    getYearlyDiscountPercent,
    confirmationModalSwitchToYearlyMessage,
    confirmationModalSwitchToMonthlyMessage,
    confirmationModalSwitchToOrganizationMessage,
    confirmationModalSwitchToProMessage,
    confirmationModalCancelPlanSwitchingMessage,
    confirmationModalCancelIntervalSwitchingMessage,
  };
};
