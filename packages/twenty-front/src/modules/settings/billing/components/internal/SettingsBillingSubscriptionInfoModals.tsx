import { BILLING_MODAL_IDS } from '@/settings/billing/constants/BillingModalIds';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { useLingui } from '@lingui/react/macro';

type SettingsBillingSubscriptionInfoModalsProps = {
  cancelIntervalSwitchingSubtitle: string;
  cancelPlanSwitchingSubtitle: string;
  isCancellingIntervalSwitch: boolean;
  isCancellingMeteredSwitch: boolean;
  isCancellingPlanSwitch: boolean;
  isEndTrialPeriodLoading: boolean;
  isSwitchingInterval: boolean;
  isSwitchingPlan: boolean;
  onCancelIntervalSwitching: () => void;
  onCancelPlanSwitching: () => void;
  onCancelResourceCreditSwitching: () => void;
  onEndTrialPeriod: () => void;
  onSwitchInterval: () => void;
  onSwitchPlan: () => void;
  startSubscriptionSubtitle: string;
  switchToMonthlySubtitle: string;
  switchToOrganizationSubtitle: string;
  switchToProSubtitle: string;
  switchToYearlySubtitle: string;
};

export const SettingsBillingSubscriptionInfoModals = ({
  cancelIntervalSwitchingSubtitle,
  cancelPlanSwitchingSubtitle,
  isCancellingIntervalSwitch,
  isCancellingMeteredSwitch,
  isCancellingPlanSwitch,
  isEndTrialPeriodLoading,
  isSwitchingInterval,
  isSwitchingPlan,
  onCancelIntervalSwitching,
  onCancelPlanSwitching,
  onCancelResourceCreditSwitching,
  onEndTrialPeriod,
  onSwitchInterval,
  onSwitchPlan,
  startSubscriptionSubtitle,
  switchToMonthlySubtitle,
  switchToOrganizationSubtitle,
  switchToProSubtitle,
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
        modalInstanceId={BILLING_MODAL_IDS.switchBillingPlanToEnterprise}
        title={t`Change to Organization Plan?`}
        subtitle={switchToOrganizationSubtitle}
        onConfirmClick={onSwitchPlan}
        confirmButtonText={t`Confirm`}
        confirmButtonAccent="blue"
        loading={isSwitchingPlan}
      />
      <ConfirmationModal
        modalInstanceId={BILLING_MODAL_IDS.switchBillingPlanToPro}
        title={t`Change to Pro Plan?`}
        subtitle={switchToProSubtitle}
        onConfirmClick={onSwitchPlan}
        confirmButtonText={t`Confirm`}
        confirmButtonAccent="blue"
        loading={isSwitchingPlan}
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
      <ConfirmationModal
        modalInstanceId={BILLING_MODAL_IDS.endTrialPeriod}
        title={t`Start Your Subscription`}
        subtitle={startSubscriptionSubtitle}
        onConfirmClick={onEndTrialPeriod}
        confirmButtonText={t`Confirm`}
        confirmButtonAccent="blue"
        loading={isEndTrialPeriodLoading}
      />
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
