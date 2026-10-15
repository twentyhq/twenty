import { SettingsBillingPlanComparisonTable } from '@/settings/billing/components/internal/SettingsBillingPlanComparisonTable';
import { useHandleCheckoutSession } from '@/settings/billing/hooks/useHandleCheckoutSession';
import { type SettingsBillingPlanAction } from '@/settings/billing/types/SettingsBillingPlanAction';
import { type SettingsBillingComparedPlan } from '@/settings/billing/types/SettingsBillingComparedPlan';
import {
  type SettingsBillingComparedPlanKeys,
  type SettingsBillingPlanInterval,
  type SettingsBillingPlanPrices,
} from '@/settings/billing/types/SettingsBillingPlanComparison';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { useLingui } from '@lingui/react/macro';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';

type SettingsBillingPlansWithoutSubscriptionProps = {
  billingInterval: SettingsBillingPlanInterval;
  comparedPlanKeys: SettingsBillingComparedPlanKeys;
  onBillingIntervalChange: (
    billingInterval: SettingsBillingPlanInterval,
  ) => void;
  planPrices: SettingsBillingPlanPrices;
};

export const SettingsBillingPlansWithoutSubscription = ({
  billingInterval,
  comparedPlanKeys,
  onBillingIntervalChange,
  planPrices,
}: SettingsBillingPlansWithoutSubscriptionProps) => {
  const { t } = useLingui();
  const [firstPlanKey, secondPlanKey] = comparedPlanKeys;
  const {
    handleCheckoutSession: handleFirstPlanCheckoutSession,
    isSubmitting: isFirstPlanCheckoutSessionSubmitting,
  } = useHandleCheckoutSession({
    recurringInterval: billingInterval,
    plan: firstPlanKey,
    requirePaymentMethod: true,
    successUrlPath: getSettingsPath(SettingsPath.Billing),
  });
  const {
    handleCheckoutSession: handleSecondPlanCheckoutSession,
    isSubmitting: isSecondPlanCheckoutSessionSubmitting,
  } = useHandleCheckoutSession({
    recurringInterval: billingInterval,
    plan: secondPlanKey,
    requirePaymentMethod: true,
    successUrlPath: getSettingsPath(SettingsPath.Billing),
  });

  const createChoosePlanAction = ({
    handleCheckoutSession,
    isDisabled,
    isLoading,
  }: {
    handleCheckoutSession: () => Promise<void>;
    isDisabled: boolean;
    isLoading: boolean;
  }): SettingsBillingPlanAction => ({
    color: 'accent',
    disabled: isDisabled,
    isLoading,
    onClick: handleCheckoutSession,
    title: t`Choose plan`,
    variant: 'solid',
  });

  const isAnyCheckoutSessionSubmitting =
    isFirstPlanCheckoutSessionSubmitting ||
    isSecondPlanCheckoutSessionSubmitting;

  const comparedPlans: SettingsBillingComparedPlan[] = [
    {
      planKey: firstPlanKey,
      action: createChoosePlanAction({
        handleCheckoutSession: handleFirstPlanCheckoutSession,
        isDisabled: isAnyCheckoutSessionSubmitting,
        isLoading: isFirstPlanCheckoutSessionSubmitting,
      }),
    },
    {
      planKey: secondPlanKey,
      action: createChoosePlanAction({
        handleCheckoutSession: handleSecondPlanCheckoutSession,
        isDisabled: isAnyCheckoutSessionSubmitting,
        isLoading: isSecondPlanCheckoutSessionSubmitting,
      }),
    },
  ];

  return (
    <SettingsPageContainer overflow="visible">
      <SettingsBillingPlanComparisonTable
        billingInterval={billingInterval}
        comparedPlans={comparedPlans}
        onBillingIntervalChange={onBillingIntervalChange}
        planPrices={planPrices}
      />
    </SettingsPageContainer>
  );
};
