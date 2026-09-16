import { BILLING_MODAL_IDS } from '@/settings/billing/constants/BillingModalIds';
import { useBillingWording } from '@/settings/billing/hooks/useBillingWording';
import { useSwitchBillingPlan } from '@/settings/billing/hooks/useSwitchBillingPlan';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { useLingui } from '@lingui/react/macro';
import { BillingPlanKey } from '~/generated-metadata/graphql';

export const SettingsBillingPlanSwitchModals = () => {
  const { t } = useLingui();
  const {
    confirmationModalSwitchToOrganizationMessage,
    confirmationModalSwitchToProMessage,
  } = useBillingWording();
  const { switchBillingPlan } = useSwitchBillingPlan();

  return (
    <>
      <ConfirmationModal
        modalInstanceId={BILLING_MODAL_IDS.switchBillingPlanToEnterprise}
        title={t`Change to Organization Plan?`}
        subtitle={confirmationModalSwitchToOrganizationMessage()}
        onConfirmClick={() => switchBillingPlan(BillingPlanKey.ENTERPRISE)}
        confirmButtonText={t`Confirm`}
        confirmButtonAccent="blue"
      />
      <ConfirmationModal
        modalInstanceId={BILLING_MODAL_IDS.switchBillingPlanToPro}
        title={t`Change to Pro Plan?`}
        subtitle={confirmationModalSwitchToProMessage()}
        onConfirmClick={() => switchBillingPlan(BillingPlanKey.PRO)}
        confirmButtonText={t`Confirm`}
        confirmButtonAccent="blue"
      />
    </>
  );
};
