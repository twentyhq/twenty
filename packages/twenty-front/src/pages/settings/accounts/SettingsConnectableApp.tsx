import { AppChip } from '@/applications/components/AppChip';
import { SettingsConnectableAppConnectionsSection } from '@/settings/app-preferences/components/SettingsConnectableAppConnectionsSection';
import { useConnectableApp } from '@/settings/app-preferences/hooks/useConnectableApp';
import { SettingsApplicationLoadErrorBanner } from '@/settings/applications/components/SettingsApplicationLoadErrorBanner';
import { SettingsApplicationOverviewCard } from '@/settings/applications/components/SettingsApplicationOverviewCard';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsSectionSkeletonLoader } from '@/settings/components/SettingsSectionSkeletonLoader';
import { SettingsPageLayout } from '@/settings/components/layout/SettingsPageLayout';
import { useLingui } from '@lingui/react/macro';
import { Navigate, useParams } from 'react-router-dom';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import { Section } from 'twenty-ui/components/layout';

export const SettingsConnectableApp = () => {
  const { t } = useLingui();
  const { applicationId } = useParams<{ applicationId: string }>();
  const {
    connectableApp,
    isLoading,
    hasConnectableAppsLoadError,
    refetchConnectableApps,
  } = useConnectableApp(applicationId);

  if (
    !isDefined(connectableApp) &&
    !isLoading &&
    !hasConnectableAppsLoadError
  ) {
    return (
      <Navigate to={getSettingsPath(SettingsPath.AppPreferences)} replace />
    );
  }

  const appName = connectableApp?.name ?? '';

  return (
    <SettingsPageLayout
      title={appName}
      icon={
        isDefined(connectableApp) ? (
          <AppChip
            logoUrl={connectableApp.logoUrl}
            fallbackApplicationData={{ name: appName }}
            size="md"
            chipOnly
          />
        ) : undefined
      }
      links={[
        {
          children: t`User`,
          href: getSettingsPath(SettingsPath.ProfilePage),
        },
        {
          children: t`Apps preferences`,
          href: getSettingsPath(SettingsPath.AppPreferences),
        },
        { children: appName },
      ]}
    >
      <SettingsPageContainer>
        {isDefined(connectableApp) ? (
          <>
            <Section.Root>
              <SettingsApplicationOverviewCard
                logoUrl={connectableApp.logoUrl}
                displayName={appName}
                description={connectableApp.description}
              />
            </Section.Root>
            <SettingsConnectableAppConnectionsSection
              connectableApp={connectableApp}
            />
          </>
        ) : hasConnectableAppsLoadError && !isLoading ? (
          <SettingsApplicationLoadErrorBanner
            message={t`This app could not be loaded. Check your connection and try again.`}
            onRetry={refetchConnectableApps}
          />
        ) : (
          <SettingsSectionSkeletonLoader />
        )}
      </SettingsPageContainer>
    </SettingsPageLayout>
  );
};
