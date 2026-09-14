import { SettingsBillingPlanComparisonTable } from '@/settings/billing/components/internal/SettingsBillingPlanComparisonTable';
import { BILLING_MODAL_IDS } from '@/settings/billing/constants/BillingModalIds';
import { useBillingPlanActions } from '@/settings/billing/hooks/useBillingPlanActions';
import { useBillingWording } from '@/settings/billing/hooks/useBillingWording';
import {
  type SettingsBillingPlanInterval,
  type SettingsBillingPlanPrices,
} from '@/settings/billing/types/settingsBillingPlanComparison.type';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { useLingui } from '@lingui/react/macro';
import { BillingPlanKey } from '~/generated-metadata/graphql';

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
  const { t } = useLingui();
  const {
    confirmationModalSwitchToMonthlyMessage,
    confirmationModalSwitchToOrganizationMessage,
    confirmationModalSwitchToProMessage,
    confirmationModalSwitchToYearlyMessage,
  } = useBillingWording();
  const {
    isSwitchingInterval,
    isSwitchingPlan,
    planActions,
    switchBillingInterval,
    switchBillingPlan,
  } = useBillingPlanActions({
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
      <ConfirmationModal
        modalInstanceId={BILLING_MODAL_IDS.switchBillingPlanToEnterprise}
        title={t`Change to Organization Plan?`}
        subtitle={confirmationModalSwitchToOrganizationMessage(billingInterval)}
        onConfirmClick={() => switchBillingPlan(BillingPlanKey.ENTERPRISE)}
        confirmButtonText={t`Confirm`}
        confirmButtonAccent="blue"
        loading={isSwitchingPlan}
      />
      <ConfirmationModal
        modalInstanceId={BILLING_MODAL_IDS.switchBillingPlanToPro}
        title={t`Change to Pro Plan?`}
        subtitle={confirmationModalSwitchToProMessage(billingInterval)}
        onConfirmClick={() => switchBillingPlan(BillingPlanKey.PRO)}
        confirmButtonText={t`Confirm`}
        confirmButtonAccent="blue"
        loading={isSwitchingPlan}
      />
      <ConfirmationModal
        modalInstanceId={BILLING_MODAL_IDS.switchBillingIntervalToYearly}
        title={t`Change to Yearly?`}
        subtitle={confirmationModalSwitchToYearlyMessage()}
        onConfirmClick={switchBillingInterval}
        confirmButtonText={t`Confirm`}
        confirmButtonAccent="blue"
        loading={isSwitchingInterval}
      />
      <ConfirmationModal
        modalInstanceId={BILLING_MODAL_IDS.switchBillingIntervalToMonthly}
        title={t`Change to Monthly?`}
        subtitle={confirmationModalSwitchToMonthlyMessage()}
        onConfirmClick={switchBillingInterval}
        confirmButtonText={t`Confirm`}
        confirmButtonAccent="blue"
        loading={isSwitchingInterval}
      />
    </SettingsPageContainer>
  );
};
