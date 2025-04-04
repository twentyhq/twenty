import { useEndSubscriptionTrialPeriod } from '@/billing/hooks/useEndSubscriptionTrialPeriod';
import { InformationBanner } from '@/information-banner/components/InformationBanner';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';

export const InformationBannerEndTrialPeriod = () => {
  const { endTrialPeriod } = useEndSubscriptionTrialPeriod();
  const { t } = useLingui();
  const [isLoading, setIsLoading] = useState(false);

  const endSubscriptionTrialPeriod = async () => {
    setIsLoading(true);
    await endTrialPeriod();
    setIsLoading(false);
  };

  return (
    <InformationBanner
      variant="danger"
      message={t`No free workflow executions left. End trial period and activate your billing to continue.`}
      buttonTitle={t`Activate`}
      buttonOnClick={() => endSubscriptionTrialPeriod()}
      isButtonDisabled={isLoading}
    />
  );
};
