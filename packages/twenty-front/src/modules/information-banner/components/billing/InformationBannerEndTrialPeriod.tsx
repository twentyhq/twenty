import { useEndSubscriptionTrialPeriod } from '@/billing/hooks/useEndSubscriptionTrialPeriod';
import { InformationBanner } from '@/information-banner/components/InformationBanner';
import { useLingui } from '@lingui/react/macro';

export const InformationBannerEndTrialPeriod = () => {
  const { endTrialPeriod, isLoading } = useEndSubscriptionTrialPeriod();
  const { t } = useLingui();

  return (
    <InformationBanner
      variant="danger"
      message={t`No free workflow executions left. End trial period and activate your billing to continue.`}
      buttonTitle={t`Activate`}
      buttonOnClick={async () => await endTrialPeriod()}
      isButtonDisabled={isLoading}
    />
  );
};
