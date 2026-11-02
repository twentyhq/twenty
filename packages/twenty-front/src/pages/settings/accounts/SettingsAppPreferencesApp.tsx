import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { isBuiltInAccountAppId } from '@/settings/app-preferences/utils/isBuiltInAccountAppId';
import { SettingsProtectedRouteWrapper } from '@/settings/components/SettingsProtectedRouteWrapper';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useParams } from 'react-router-dom';
import { PermissionFlagType } from '~/generated-metadata/graphql';
import { SettingsApplicationPreferences } from '~/pages/settings/accounts/SettingsApplicationPreferences';
import { SettingsBuiltInAccountApp } from '~/pages/settings/accounts/SettingsBuiltInAccountApp';
import { SettingsConnectableApp } from '~/pages/settings/accounts/SettingsConnectableApp';

export const SettingsAppPreferencesApp = () => {
  const { applicationId } = useParams<{ applicationId: string }>();
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);

  const isInstalledApplication = (
    currentWorkspace?.installedApplications ?? []
  ).some(({ id }) => id === applicationId);

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
