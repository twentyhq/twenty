import { InformationBanner } from '@/information-banner/components/InformationBanner';
import { StartSubscriptionConfirmationModal } from '@/settings/billing/components/StartSubscriptionConfirmationModal';
import { billingHasPaymentMethodSelector } from '@/settings/billing/states/billingHasPaymentMethodSelector';
import { useEndSubscriptionTrialPeriod } from '@/settings/billing/hooks/useEndSubscriptionTrialPeriod';
import { usePermissionFlagMap } from '@/settings/roles/hooks/usePermissionFlagMap';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useLingui } from '@lingui/react/macro';
import { PermissionFlagType } from '~/generated-metadata/graphql';

const INFORMATION_BANNER_END_TRIAL_PERIOD_MODAL_ID =
  'information-banner-end-trial-period-modal';

export const InformationBannerEndTrialPeriod = () => {
  const { endTrialPeriod, isLoading } = useEndSubscriptionTrialPeriod();
  const { t } = useLingui();
  const { openModal } = useModal();

  const { [PermissionFlagType.WORKSPACE]: hasPermissionToEndTrialPeriod } =
    usePermissionFlagMap();

  const billingHasPaymentMethod = useAtomStateValue(
    billingHasPaymentMethodSelector,
  );

  return (
    <>
      <InformationBanner
        componentInstanceId="information-banner-end-trial-period"
        color="danger"
        variant="secondary"
        message={
          hasPermissionToEndTrialPeriod
            ? t`End trial period to continue using Workflow or AI features.`
            : t`Contact your admin to continue using Workflow or AI features.`
        }
        buttonTitle={
          hasPermissionToEndTrialPeriod
            ? billingHasPaymentMethod === false
              ? t`Add Credit Card`
              : t`End Trial Period`
            : undefined
        }
        buttonOnClick={() =>
          openModal(INFORMATION_BANNER_END_TRIAL_PERIOD_MODAL_ID)
        }
        isButtonDisabled={isLoading}
      />
      {hasPermissionToEndTrialPeriod && (
        <StartSubscriptionConfirmationModal
          modalInstanceId={INFORMATION_BANNER_END_TRIAL_PERIOD_MODAL_ID}
          hasPaymentMethod={billingHasPaymentMethod}
          onConfirmClick={async () => {
            await endTrialPeriod();
          }}
          loading={isLoading}
        />
      )}
    </>
  );
};
