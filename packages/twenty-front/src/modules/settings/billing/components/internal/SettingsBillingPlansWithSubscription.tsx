import { SettingsBillingPlanComparisonTable } from '@/settings/billing/components/internal/SettingsBillingPlanComparisonTable';
import { SettingsBillingPlanSwitchModals } from '@/settings/billing/components/internal/SettingsBillingPlanSwitchModals';
import { SettingsBillingSwitchModals } from '@/settings/billing/components/internal/SettingsBillingSwitchModals';
import { useBillingPlanActions } from '@/settings/billing/hooks/useBillingPlanActions';
import {
  type SettingsBillingPlanInterval,
  type SettingsBillingPlanPrices,
} from '@/settings/billing/types/settingsBillingPlanComparison.type';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { type BillingPlanKey } from '~/generated-metadata/graphql';

type SettingsBillingPlansWithSubscriptionProps = {
  billingInterval: SettingsBillingPlanInterval;
  currentPlanKey: BillingPlanKey;
  onBillingIntervalChange: (
    billingInterval: SettingsBillingPlanInterval,
  ) => void;
  planPrices: SettingsBillingPlanPrices;
};

export const SettingsBillingPlansWithSubscription = ({
  billingInterval,
  currentPlanKey,
  onBillingIntervalChange,
  planPrices,
}: SettingsBillingPlansWithSubscriptionProps) => {
  const { planActions } = useBillingPlanActions({
    currentPlanKey,
    selectedInterval: billingInterval,
  });

  return (
    <SettingsPageContainer overflow="visible">
      <SettingsBillingPlanComparisonTable
        billingInterval={billingInterval}
        onBillingIntervalChange={onBillingIntervalChange}
        planActions={planActions}
        planPrices={planPrices}
      />
      <SettingsBillingPlanSwitchModals />
      <SettingsBillingSwitchModals />
    </SettingsPageContainer>
  );
};
