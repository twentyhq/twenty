import { useFormatPrices } from '@/settings/billing/hooks/useFormatPrices';
import { type SettingsBillingPlanInterval } from '@/settings/billing/types/settingsBillingPlanComparison.type';
import {
  BillingPlanKey,
  SubscriptionInterval,
  SubscriptionStatus,
} from '~/generated-metadata/graphql';
import { capitalize, isDefined } from 'twenty-shared/utils';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useSubscriptionStatus } from '@/workspace/hooks/useSubscriptionStatus';
import { useLingui } from '@lingui/react/macro';
import { beautifyExactDate } from '~/utils/date-utils';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

type GetPlanPriceParams = {
  billingInterval?: SettingsBillingPlanInterval;
  planKey: BillingPlanKey;
};

const parseBillingPlanKey = (planKey: unknown): BillingPlanKey | undefined => {
  if (planKey === BillingPlanKey.ENTERPRISE || planKey === BillingPlanKey.PRO) {
    return planKey;
  }

  return undefined;
};

export const useBillingWording = () => {
  const { t } = useLingui();

  const currentWorkspace = useAtomStateValue(currentWorkspaceState);
  const currentBillingSubscription =
    currentWorkspace?.currentBillingSubscription;

  const { formatPrices } = useFormatPrices();

  const subscriptionStatus = useSubscriptionStatus();

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
    const currentPeriodEnd = currentBillingSubscription?.currentPeriodEnd;

    if (!isDefined(currentPeriodEnd)) {
      return '';
    }

    return beautifyExactDate(new Date(currentPeriodEnd));
  };

  const getIntervalLabelAsAdjectiveCapitalize = (isMonthlyPlan: boolean) => {
    return capitalize(getIntervalLabel(isMonthlyPlan, true));
  };

  const currentPlanKey = parseBillingPlanKey(
    currentBillingSubscription?.metadata?.['plan'],
  );

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
      currentBillingSubscription?.interval === SubscriptionInterval.Month,
    );

  const resolveBillingWordingInterval = (
    billingInterval?: SettingsBillingPlanInterval,
  ): SettingsBillingPlanInterval => {
    if (isDefined(billingInterval)) {
      return billingInterval;
    }

    if (isDefined(currentBillingSubscription?.interval)) {
      return currentBillingSubscription.interval;
    }

    return SubscriptionInterval.Year;
  };

  const getPlanPrice = ({ billingInterval, planKey }: GetPlanPriceParams) =>
    formatPrices[planKey]?.[resolveBillingWordingInterval(billingInterval)];

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

  const confirmationModalSwitchToOrganizationMessage = (
    billingInterval?: SettingsBillingPlanInterval,
  ) => {
    const targetInterval = resolveBillingWordingInterval(billingInterval);
    const enterprisePrice = getPlanPrice({
      billingInterval: targetInterval,
      planKey: BillingPlanKey.ENTERPRISE,
    });
    const suffix =
      targetInterval === SubscriptionInterval.Year ? t` billed annually` : '';

    if (subscriptionStatus === SubscriptionStatus.Trialing) {
      return t`Your plan will switch to Organization immediately and your trial will continue. When it ends, you will be charged $${enterprisePrice} per user per month${suffix}.`;
    }

    const body = t`you will be charged $${enterprisePrice} per user per month`;
    return capitalize(`${body}${suffix}.`);
  };

  const confirmationModalSwitchToProMessage = (
    billingInterval?: SettingsBillingPlanInterval,
  ) => {
    const targetInterval = resolveBillingWordingInterval(billingInterval);
    const proPrice = getPlanPrice({
      billingInterval: targetInterval,
      planKey: BillingPlanKey.PRO,
    });
    const suffix =
      targetInterval === SubscriptionInterval.Year ? t` billed annually` : '';

    if (subscriptionStatus === SubscriptionStatus.Trialing) {
      return t`Your plan will switch to Pro immediately and your trial will continue. When it ends, you will be charged $${proPrice} per user per month${suffix}.`;
    }

    const beautifiedRenewDate = getBeautifiedRenewDate();
    const scheduledChangeSuffix = t`. The change will be applied the ${beautifiedRenewDate}.`;
    const body = t`You will be charged $${proPrice} per user per month`;
    return `${body}${suffix}${scheduledChangeSuffix}`;
  };

  const confirmationModalCancelPlanSwitchingMessage = () => {
    const planKeyWord =
      currentPlanKey === BillingPlanKey.ENTERPRISE ? t`Organization` : t`Pro`;

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
