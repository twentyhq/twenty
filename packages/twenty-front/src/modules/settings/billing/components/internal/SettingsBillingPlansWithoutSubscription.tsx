import { SettingsBillingPlanComparisonTable } from '@/settings/billing/components/internal/SettingsBillingPlanComparisonTable';
import { useHandleCheckoutSession } from '@/settings/billing/hooks/useHandleCheckoutSession';
import { type SettingsBillingPlanAction } from '@/settings/billing/types/SettingsBillingPlanAction';
import {
  type SettingsBillingPlanInterval,
  type SettingsBillingPlanPrices,
} from '@/settings/billing/types/SettingsBillingPlanComparison';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { type BillingPlanKey } from '~/generated-metadata/graphql';

type SettingsBillingPlansWithoutSubscriptionProps = {
  billingInterval: SettingsBillingPlanInterval;
  onBillingIntervalChange: (
    billingInterval: SettingsBillingPlanInterval,
  ) => void;
  planKeys: BillingPlanKey[];
  planPrices: SettingsBillingPlanPrices;
};

export const SettingsBillingPlansWithoutSubscription = ({
  billingInterval,
  onBillingIntervalChange,
  planKeys,
  planPrices,
}: SettingsBillingPlansWithoutSubscriptionProps) => {
  const { t } = useLingui();
  const [checkoutPlanKey, setCheckoutPlanKey] = useState<BillingPlanKey | null>(
    null,
  );
  const { handleCheckoutSession, isSubmitting } = useHandleCheckoutSession({
    recurringInterval: billingInterval,
    requirePaymentMethod: true,
    successUrlPath: getSettingsPath(SettingsPath.Billing),
  });

  const createChoosePlanAction = (
    planKey: BillingPlanKey,
  ): SettingsBillingPlanAction => ({
    color: 'accent',
    disabled: isSubmitting,
    isLoading: isSubmitting && checkoutPlanKey === planKey,
    onClick: () => {
      setCheckoutPlanKey(planKey);
      void handleCheckoutSession(planKey);
    },
    title: t`Choose plan`,
    variant: 'solid',
  });

  const planActions = planKeys.map((planKey) =>
    createChoosePlanAction(planKey),
  );

  return (
    <SettingsPageContainer overflow="visible">
      <SettingsBillingPlanComparisonTable
        billingInterval={billingInterval}
        onBillingIntervalChange={onBillingIntervalChange}
        planActions={planActions}
        planKeys={planKeys}
        planPrices={planPrices}
      />
    </SettingsPageContainer>
  );
};
