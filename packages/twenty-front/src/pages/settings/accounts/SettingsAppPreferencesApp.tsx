import { useIsInstalledApplication } from '@/settings/app-preferences/hooks/useIsInstalledApplication';
import { isBuiltInAccountAppId } from '@/settings/app-preferences/utils/isBuiltInAccountAppId';
import { SettingsProtectedRouteWrapper } from '@/settings/components/SettingsProtectedRouteWrapper';
import { useParams } from 'react-router-dom';
import { PermissionFlagType } from '~/generated-metadata/graphql';
import { SettingsApplicationPreferences } from '~/pages/settings/accounts/SettingsApplicationPreferences';
import { SettingsBuiltInAccountApp } from '~/pages/settings/accounts/SettingsBuiltInAccountApp';
import { SettingsConnectableApp } from '~/pages/settings/accounts/SettingsConnectableApp';

export const SettingsAppPreferencesApp = () => {
  const { applicationId } = useParams<{ applicationId: string }>();
  const isInstalledApplication = useIsInstalledApplication(applicationId);

  // Any member connects their own client, even without access to the workspace's connected accounts
  if (!isBuiltInAccountAppId(applicationId) && !isInstalledApplication) {
    return <SettingsConnectableApp />;
  }

  return (
    <SettingsProtectedRouteWrapper
      settingsPermission={PermissionFlagType.CONNECTED_ACCOUNTS}
    >
      {isBuiltInAccountAppId(applicationId) ? (
        <SettingsBuiltInAccountApp />
      ) : (
        <SettingsApplicationPreferences />
      )}
    </SettingsProtectedRouteWrapper>
  );
};
