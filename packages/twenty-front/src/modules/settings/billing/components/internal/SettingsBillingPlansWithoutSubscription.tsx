import { SettingsBillingPlanComparisonTable } from '@/settings/billing/components/internal/SettingsBillingPlanComparisonTable';
import { useHandleCheckoutSession } from '@/settings/billing/hooks/useHandleCheckoutSession';
import { type SettingsBillingPlanAction } from '@/settings/billing/types/settingsBillingPlanAction.type';
import {
  type SettingsBillingPlanInterval,
  type SettingsBillingPlanPrices,
} from '@/settings/billing/types/settingsBillingPlanComparison.type';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { useLingui } from '@lingui/react/macro';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { BillingPlanKey } from '~/generated-metadata/graphql';

type SettingsBillingPlansWithoutSubscriptionProps = {
  billingInterval: SettingsBillingPlanInterval;
  onBillingIntervalChange: (
    billingInterval: SettingsBillingPlanInterval,
  ) => void;
  planPrices: SettingsBillingPlanPrices;
};

export const SettingsBillingPlansWithoutSubscription = ({
  billingInterval,
  onBillingIntervalChange,
  planPrices,
}: SettingsBillingPlansWithoutSubscriptionProps) => {
  const { t } = useLingui();
  const {
    handleCheckoutSession: handleProCheckoutSession,
    isSubmitting: isProCheckoutSessionSubmitting,
  } = useHandleCheckoutSession({
    recurringInterval: billingInterval,
    plan: BillingPlanKey.PRO,
    requirePaymentMethod: true,
    successUrlPath: getSettingsPath(SettingsPath.Billing),
  });
  const {
    handleCheckoutSession: handleEnterpriseCheckoutSession,
    isSubmitting: isEnterpriseCheckoutSessionSubmitting,
  } = useHandleCheckoutSession({
    recurringInterval: billingInterval,
    plan: BillingPlanKey.ENTERPRISE,
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
    accent: 'blue',
    disabled: isDisabled,
    isLoading,
    onClick: handleCheckoutSession,
    title: t`Choose plan`,
    variant: 'primary',
  });

  const isAnyCheckoutSessionSubmitting =
    isProCheckoutSessionSubmitting || isEnterpriseCheckoutSessionSubmitting;

  const planActions: Record<BillingPlanKey, SettingsBillingPlanAction> = {
    [BillingPlanKey.PRO]: createChoosePlanAction({
      handleCheckoutSession: handleProCheckoutSession,
      isDisabled: isAnyCheckoutSessionSubmitting,
      isLoading: isProCheckoutSessionSubmitting,
    }),
    [BillingPlanKey.ENTERPRISE]: createChoosePlanAction({
      handleCheckoutSession: handleEnterpriseCheckoutSession,
      isDisabled: isAnyCheckoutSessionSubmitting,
      isLoading: isEnterpriseCheckoutSessionSubmitting,
    }),
  };

  return (
    <SettingsPageContainer overflow="visible">
      <SettingsBillingPlanComparisonTable
        billingInterval={billingInterval}
        onBillingIntervalChange={onBillingIntervalChange}
        planActions={planActions}
        planPrices={planPrices}
      />
    </SettingsPageContainer>
  );
};
