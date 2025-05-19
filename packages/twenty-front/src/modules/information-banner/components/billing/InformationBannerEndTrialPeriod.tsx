import { useEndSubscriptionTrialPeriod } from '@/billing/hooks/useEndSubscriptionTrialPeriod';
import { InformationBanner } from '@/information-banner/components/InformationBanner';
import { useSettingsPermissionMap } from '@/settings/roles/hooks/useSettingsPermissionMap';
import { useLingui } from '@lingui/react/macro';
import { SettingPermissionType } from '~/generated-metadata/graphql';

export const InformationBannerEndTrialPeriod = () => {
  const { endTrialPeriod, isLoading } = useEndSubscriptionTrialPeriod();
  const { t } = useLingui();

  const { [SettingPermissionType.WORKSPACE]: hasPermissionToEndTrialPeriod } =
    useSettingsPermissionMap();

  return (
    <InformationBanner
      variant="danger"
      message={
        hasPermissionToEndTrialPeriod
          ? t`No free workflow executions left. End trial period and activate your billing to continue.`
          : t`No free workflow executions left. Please contact your admin.`
      }
      buttonTitle={hasPermissionToEndTrialPeriod ? t`Activate` : undefined}
      buttonOnClick={async () => await endTrialPeriod()}
      isButtonDisabled={isLoading}
    />
  );
};
