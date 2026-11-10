import { useConnectableAppStatusesById } from '@/settings/app-preferences/hooks/useConnectableAppStatusesById';
import { useConnectableApps } from '@/settings/app-preferences/hooks/useConnectableApps';
import { SettingsApplicationLoadErrorBanner } from '@/settings/applications/components/SettingsApplicationLoadErrorBanner';
import { SettingsApplicationsTable } from '@/settings/applications/components/SettingsApplicationsTable';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledToolbar = styled.div`
  padding-bottom: ${themeCssVariables.spacing[2]};
`;

export const SettingsConnectableAppsSection = () => {
  const { t } = useLingui();
  const {
    connectableApps,
    isLoading,
    hasConnectableAppsLoadError,
    refetchConnectableApps,
  } = useConnectableApps();
  const connectableAppStatusesById =
    useConnectableAppStatusesById(connectableApps);

  return (
    <SettingsApplicationsTable
      title={t`Apps`}
      description={t`Choose your preferences for the apps installed on your workspace by the admin`}
      toolbar={
        hasConnectableAppsLoadError ? (
          <StyledToolbar>
            <SettingsApplicationLoadErrorBanner
              message={t`The apps you can connect could not be loaded. Check your connection and try again.`}
              onRetry={refetchConnectableApps}
            />
          </StyledToolbar>
        ) : undefined
      }
      applications={[]}
      builtInApps={[]}
      connectableApps={connectableApps}
      linkTarget="applicationPreferences"
      middleColumn="status"
      statusesById={connectableAppStatusesById}
      isLoading={isLoading}
    />
  );
};
