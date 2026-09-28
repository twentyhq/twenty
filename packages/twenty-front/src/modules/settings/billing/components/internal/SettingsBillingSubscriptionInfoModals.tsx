import { AddCreditCardModal } from '@/settings/billing/components/AddCreditCardModal';
import { BILLING_MODAL_IDS } from '@/settings/billing/constants/BillingModalIds';
import { type BillingSubscriptionChangeWording } from '@/settings/billing/types/BillingSubscriptionChangeWording';
import { ConfirmationDialog } from '@/ui/layout/dialog/components/ConfirmationDialog';
import { useLingui } from '@lingui/react/macro';

type SettingsBillingSubscriptionInfoModalsProps = {
  billingHasPaymentMethod: boolean | null | undefined;
  cancelIntervalSwitchingWording: BillingSubscriptionChangeWording;
  cancelPlanSwitchingWording: BillingSubscriptionChangeWording;
  isApplyingSubscriptionChange: boolean;
  isCancellingMeteredSwitch: boolean;
  isEndTrialPeriodLoading: boolean;
  onCancelIntervalSwitching: () => void;
  onCancelPlanSwitching: () => void;
  onCancelResourceCreditSwitching: () => void;
  onEndTrialPeriod: () => void;
  onPaymentMethodAdded: () => Promise<void>;
  onSwitchInterval: () => void;
  startSubscriptionSubtitle: string;
  switchToMonthlyWording: BillingSubscriptionChangeWording;
  switchToYearlyWording: BillingSubscriptionChangeWording;
};

export const SettingsBillingSubscriptionInfoModals = ({
  billingHasPaymentMethod,
  cancelIntervalSwitchingWording,
  cancelPlanSwitchingWording,
  isApplyingSubscriptionChange,
  isCancellingMeteredSwitch,
  isEndTrialPeriodLoading,
  onCancelIntervalSwitching,
  onCancelPlanSwitching,
  onCancelResourceCreditSwitching,
  onEndTrialPeriod,
  onPaymentMethodAdded,
  onSwitchInterval,
  startSubscriptionSubtitle,
  switchToMonthlyWording,
  switchToYearlyWording,
}: SettingsBillingSubscriptionInfoModalsProps) => {
  const { t } = useLingui();

  return (
    <>
      <ConfirmationDialog
        dialogId={BILLING_MODAL_IDS.switchBillingIntervalToYearly}
        title={switchToYearlyWording.title}
        subtitle={switchToYearlyWording.subtitle}
        onConfirmClick={onSwitchInterval}
        confirmButtonText={t`Confirm`}
        confirmButtonColor="accent"
        loading={isApplyingSubscriptionChange}
      />
      <ConfirmationDialog
        dialogId={BILLING_MODAL_IDS.switchBillingIntervalToMonthly}
        title={switchToMonthlyWording.title}
        subtitle={switchToMonthlyWording.subtitle}
        onConfirmClick={onSwitchInterval}
        confirmButtonText={t`Confirm`}
        confirmButtonColor="accent"
        loading={isApplyingSubscriptionChange}
      />
      <ConfirmationDialog
        dialogId={BILLING_MODAL_IDS.cancelSwitchBillingInterval}
        title={cancelIntervalSwitchingWording.title}
        subtitle={cancelIntervalSwitchingWording.subtitle}
        onConfirmClick={onCancelIntervalSwitching}
        confirmButtonText={t`Confirm`}
        confirmButtonColor="accent"
        loading={isApplyingSubscriptionChange}
      />
      <ConfirmationDialog
        dialogId={BILLING_MODAL_IDS.cancelSwitchBillingPlan}
        title={cancelPlanSwitchingWording.title}
        subtitle={cancelPlanSwitchingWording.subtitle}
        onConfirmClick={onCancelPlanSwitching}
        confirmButtonText={t`Confirm`}
        confirmButtonColor="accent"
        loading={isApplyingSubscriptionChange}
      />
      {billingHasPaymentMethod === false ? (
        <AddCreditCardModal
          modalInstanceId={BILLING_MODAL_IDS.endTrialPeriod}
          onPaymentMethodAdded={onPaymentMethodAdded}
        />
      ) : (
        <ConfirmationDialog
          dialogId={BILLING_MODAL_IDS.endTrialPeriod}
          title={t`Start Your Subscription`}
          subtitle={startSubscriptionSubtitle}
          onConfirmClick={onEndTrialPeriod}
          confirmButtonText={t`Confirm`}
          confirmButtonColor="accent"
          loading={isEndTrialPeriodLoading}
        />
      )}
      <ConfirmationDialog
        dialogId={BILLING_MODAL_IDS.cancelSwitchMeteredPrice}
        title={t`Cancel credit pack switching?`}
        subtitle={t`You have scheduled a credit pack change. Do you want to cancel it?`}
        onConfirmClick={onCancelResourceCreditSwitching}
        confirmButtonText={t`Confirm`}
        confirmButtonColor="accent"
        loading={isCancellingMeteredSwitch}
      />
    </>
  );
};
