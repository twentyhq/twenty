import { useEndSubscriptionTrialPeriod } from '@/billing/hooks/useEndSubscriptionTrialPeriod';
import { InformationBanner } from '@/information-banner/components/InformationBanner';
import { usePermissionFlagMap } from '@/settings/roles/hooks/usePermissionFlagMap';
import { useLingui } from '@lingui/react/macro';
import { PermissionFlagType } from '~/generated-metadata/graphql';

export const InformationBannerEndTrialPeriod = () => {
  const { endTrialPeriod, isLoading } = useEndSubscriptionTrialPeriod();
  const { t } = useLingui();

  const { [PermissionFlagType.WORKSPACE]: hasPermissionToEndTrialPeriod } =
    usePermissionFlagMap();

  return (
    <InformationBanner
      componentInstanceId="information-banner-end-trial-period"
      variant="danger"
      message={
        hasPermissionToEndTrialPeriod
          ? t`End trial period to continue using Workflow or AI features.`
          : t`Contact your admin to continue using Workflow or AI features.`
      }
      buttonTitle={
        hasPermissionToEndTrialPeriod ? t`End Trial Period` : undefined
      }
      buttonOnClick={async () => await endTrialPeriod()}
      isButtonDisabled={isLoading}
    />
  );
};
