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
import { useCurrentBillingFlags } from '@/settings/billing/hooks/useCurrentBillingFlags';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

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

  const { isYearlyPlan } = useCurrentBillingFlags();

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

  const yearlyPrice =
    formatPrices[
      currentBillingSubscription.metadata['plan'] as BillingPlanKey
    ]?.[SubscriptionInterval.Year];

  const monthlyPrice =
    formatPrices[
      currentBillingSubscription.metadata['plan'] as BillingPlanKey
    ]?.[SubscriptionInterval.Month];

  const getYearlyDiscountPercent = () =>
    isDefined(monthlyPrice) && isDefined(yearlyPrice) && monthlyPrice > 0
      ? Math.round((1 - yearlyPrice / monthlyPrice) * 100)
      : 0;

  const getCurrentIntervalLabel = () =>
    getIntervalLabelAsAdjectiveCapitalize(
      currentBillingSubscription.interval === SubscriptionInterval.Month,
    );

  const enterprisePrice =
    formatPrices[BillingPlanKey.ENTERPRISE]?.[
      currentBillingSubscription.interval as
        | SubscriptionInterval.Month
        | SubscriptionInterval.Year
    ];

  const proPrice =
    formatPrices[BillingPlanKey.PRO]?.[
      currentBillingSubscription.interval as
        | SubscriptionInterval.Month
        | SubscriptionInterval.Year
    ];

  const confirmationModalSwitchToYearlyMessage = () => {
    if (subscriptionStatus === SubscriptionStatus.Trialing) {
      return t`Your billing interval will switch to yearly immediately and your trial will continue. When it ends, you will be charged $${yearlyPrice} per user per year billed annually.`;
    }

    return t`You will be charged $${yearlyPrice} per user per year billed annually. A prorata with your current subscription will be applied.`;
  };

  const confirmationModalSwitchToMonthlyMessage = () => {
    if (subscriptionStatus === SubscriptionStatus.Trialing) {
      return t`Your billing interval will switch to monthly immediately and your trial will continue. When it ends, you will be charged $${monthlyPrice} per user per month billed monthly.`;
    }

    const beautifiedRenewDate = getBeautifiedRenewDate();
    return t`You will be charged $${monthlyPrice} per user per month billed monthly. The change will be applied the ${beautifiedRenewDate}.`;
  };

  const confirmationModalSwitchToOrganizationMessage = () => {
    if (subscriptionStatus === SubscriptionStatus.Trialing) {
      const suffix = isYearlyPlan ? t` billed annually` : '';

      return t`Your plan will switch to Organization immediately and your trial will continue. When it ends, you will be charged $${enterprisePrice} per user per month${suffix}.`;
    }

    const body = t`you will be charged $${enterprisePrice} per user per month`;
    const suffix = isYearlyPlan ? t` billed annually` : '';
    return capitalize(`${body}${suffix}.`);
  };

  const confirmationModalSwitchToProMessage = () => {
    if (subscriptionStatus === SubscriptionStatus.Trialing) {
      const suffix = isYearlyPlan ? t` billed annually` : '';

      return t`Your plan will switch to Pro immediately and your trial will continue. When it ends, you will be charged $${proPrice} per user per month${suffix}.`;
    }

    const beautifiedRenewDate = getBeautifiedRenewDate();
    const suffix1 = isYearlyPlan ? t` billed annually` : '';
    const suffix2 = t`. The change will be applied the ${beautifiedRenewDate}.`;
    const body = t`You will be charged $${proPrice} per user per month`;
    return `${body}${suffix1}${suffix2}`;
  };

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
