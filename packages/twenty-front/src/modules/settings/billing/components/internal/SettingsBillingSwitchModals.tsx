import { BILLING_MODAL_IDS } from '@/settings/billing/constants/BillingModalIds';
import { useBillingWording } from '@/settings/billing/hooks/useBillingWording';
import { useCancelBillingSwitch } from '@/settings/billing/hooks/useCancelBillingSwitch';
import { useSwitchBillingInterval } from '@/settings/billing/hooks/useSwitchBillingInterval';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { useLingui } from '@lingui/react/macro';

export const SettingsBillingSwitchModals = () => {
  const { t } = useLingui();
  const {
    confirmationModalCancelIntervalSwitchingMessage,
    confirmationModalCancelPlanSwitchingMessage,
    confirmationModalSwitchToMonthlyMessage,
    confirmationModalSwitchToYearlyMessage,
  } = useBillingWording();
  const { switchBillingInterval } = useSwitchBillingInterval();
  const { cancelIntervalSwitch, cancelPlanSwitch } = useCancelBillingSwitch();

  return (
    <>
      <ConfirmationModal
        modalInstanceId={BILLING_MODAL_IDS.switchBillingIntervalToYearly}
        title={t`Change to Yearly?`}
        subtitle={confirmationModalSwitchToYearlyMessage()}
        onConfirmClick={switchBillingInterval}
        confirmButtonText={t`Confirm`}
        confirmButtonAccent="blue"
      />
      <ConfirmationModal
        modalInstanceId={BILLING_MODAL_IDS.switchBillingIntervalToMonthly}
        title={t`Change to Monthly?`}
        subtitle={confirmationModalSwitchToMonthlyMessage()}
        onConfirmClick={switchBillingInterval}
        confirmButtonText={t`Confirm`}
        confirmButtonAccent="blue"
      />
      <ConfirmationModal
        modalInstanceId={BILLING_MODAL_IDS.cancelSwitchBillingInterval}
        title={t`Cancel interval switching?`}
        subtitle={confirmationModalCancelIntervalSwitchingMessage()}
        onConfirmClick={cancelIntervalSwitch}
        confirmButtonText={t`Confirm`}
        confirmButtonAccent="blue"
      />
      <ConfirmationModal
        modalInstanceId={BILLING_MODAL_IDS.cancelSwitchBillingPlan}
        title={t`Cancel plan switching?`}
        subtitle={confirmationModalCancelPlanSwitchingMessage()}
        onConfirmClick={cancelPlanSwitch}
        confirmButtonText={t`Confirm`}
        confirmButtonAccent="blue"
      />
    </>
  );
};
