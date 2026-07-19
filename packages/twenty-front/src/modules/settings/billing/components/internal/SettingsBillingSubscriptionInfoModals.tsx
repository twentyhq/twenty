import { AddCreditCardModal } from '@/settings/billing/components/AddCreditCardModal';
import { BILLING_MODAL_IDS } from '@/settings/billing/constants/BillingModalIds';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { useLingui } from '@lingui/react/macro';

type SettingsBillingSubscriptionInfoModalsProps = {
  billingHasPaymentMethod: boolean | null | undefined;
  cancelIntervalSwitchingSubtitle: string;
  cancelPlanSwitchingSubtitle: string;
  isCancellingIntervalSwitch: boolean;
  isCancellingMeteredSwitch: boolean;
  isCancellingPlanSwitch: boolean;
  isEndTrialPeriodLoading: boolean;
  isSwitchingInterval: boolean;
  onCancelIntervalSwitching: () => void;
  onCancelPlanSwitching: () => void;
  onCancelResourceCreditSwitching: () => void;
  onEndTrialPeriod: () => void;
  onPaymentMethodAdded: () => Promise<void>;
  onSwitchInterval: () => void;
  startSubscriptionSubtitle: string;
  switchToMonthlySubtitle: string;
  switchToYearlySubtitle: string;
};

export const SettingsBillingSubscriptionInfoModals = ({
  billingHasPaymentMethod,
  cancelIntervalSwitchingSubtitle,
  cancelPlanSwitchingSubtitle,
  isCancellingIntervalSwitch,
  isCancellingMeteredSwitch,
  isCancellingPlanSwitch,
  isEndTrialPeriodLoading,
  isSwitchingInterval,
  onCancelIntervalSwitching,
  onCancelPlanSwitching,
  onCancelResourceCreditSwitching,
  onEndTrialPeriod,
  onPaymentMethodAdded,
  onSwitchInterval,
  startSubscriptionSubtitle,
  switchToMonthlySubtitle,
  switchToYearlySubtitle,
}: SettingsBillingSubscriptionInfoModalsProps) => {
  const { t } = useLingui();

  return (
    <>
      <ConfirmationModal
        modalInstanceId={BILLING_MODAL_IDS.switchBillingIntervalToYearly}
        title={t`Change to Yearly?`}
        subtitle={switchToYearlySubtitle}
        onConfirmClick={onSwitchInterval}
        confirmButtonText={t`Confirm`}
        confirmButtonAccent="blue"
        loading={isSwitchingInterval}
      />
      <ConfirmationModal
        modalInstanceId={BILLING_MODAL_IDS.switchBillingIntervalToMonthly}
        title={t`Change to Monthly?`}
        subtitle={switchToMonthlySubtitle}
        onConfirmClick={onSwitchInterval}
        confirmButtonText={t`Confirm`}
        confirmButtonAccent="blue"
        loading={isSwitchingInterval}
      />
      <ConfirmationModal
        modalInstanceId={BILLING_MODAL_IDS.cancelSwitchBillingInterval}
        title={t`Cancel interval switching?`}
        subtitle={cancelIntervalSwitchingSubtitle}
        onConfirmClick={onCancelIntervalSwitching}
        confirmButtonText={t`Confirm`}
        confirmButtonAccent="blue"
        loading={isCancellingIntervalSwitch}
      />
      <ConfirmationModal
        modalInstanceId={BILLING_MODAL_IDS.cancelSwitchBillingPlan}
        title={t`Cancel plan switching?`}
        subtitle={cancelPlanSwitchingSubtitle}
        onConfirmClick={onCancelPlanSwitching}
        confirmButtonText={t`Confirm`}
        confirmButtonAccent="blue"
        loading={isCancellingPlanSwitch}
      />
      {billingHasPaymentMethod === false ? (
        <AddCreditCardModal
          modalInstanceId={BILLING_MODAL_IDS.endTrialPeriod}
          onPaymentMethodAdded={onPaymentMethodAdded}
        />
      ) : (
        <ConfirmationModal
          modalInstanceId={BILLING_MODAL_IDS.endTrialPeriod}
          title={t`Start Your Subscription`}
          subtitle={startSubscriptionSubtitle}
          onConfirmClick={onEndTrialPeriod}
          confirmButtonText={t`Confirm`}
          confirmButtonAccent="blue"
          loading={isEndTrialPeriodLoading}
        />
      )}
      <ConfirmationModal
        modalInstanceId={BILLING_MODAL_IDS.cancelSwitchMeteredPrice}
        title={t`Cancel credit pack switching?`}
        subtitle={t`You have scheduled a credit pack change. Do you want to cancel it?`}
        onConfirmClick={onCancelResourceCreditSwitching}
        confirmButtonText={t`Confirm`}
        confirmButtonAccent="blue"
        loading={isCancellingMeteredSwitch}
      />
    </>
  );
};
