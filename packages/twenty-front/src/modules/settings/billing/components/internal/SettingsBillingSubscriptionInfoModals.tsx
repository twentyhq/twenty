import { AddCreditCardModal } from '@/settings/billing/components/AddCreditCardModal';
import { SettingsBillingSwitchModals } from '@/settings/billing/components/internal/SettingsBillingSwitchModals';
import { BILLING_MODAL_IDS } from '@/settings/billing/constants/BillingModalIds';
import { useCancelResourceCreditSwitch } from '@/settings/billing/hooks/useCancelResourceCreditSwitch';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { useLingui } from '@lingui/react/macro';

type SettingsBillingSubscriptionInfoModalsProps = {
  billingHasPaymentMethod: boolean | null | undefined;
  isEndTrialPeriodLoading: boolean;
  onEndTrialPeriod: () => void;
  onPaymentMethodAdded: () => Promise<void>;
  startSubscriptionSubtitle: string;
};

export const SettingsBillingSubscriptionInfoModals = ({
  billingHasPaymentMethod,
  isEndTrialPeriodLoading,
  onEndTrialPeriod,
  onPaymentMethodAdded,
  startSubscriptionSubtitle,
}: SettingsBillingSubscriptionInfoModalsProps) => {
  const { t } = useLingui();
  const { cancelResourceCreditSwitch } = useCancelResourceCreditSwitch();

  return (
    <>
      <SettingsBillingSwitchModals />
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
        onConfirmClick={cancelResourceCreditSwitch}
        confirmButtonText={t`Confirm`}
        confirmButtonAccent="blue"
      />
    </>
  );
};
