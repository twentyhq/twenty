import { isBuiltInAccountAppId } from '@/settings/app-preferences/utils/isBuiltInAccountAppId';
import { isBuiltInMcpClientAppId } from '@/settings/app-preferences/utils/isBuiltInMcpClientAppId';
import { SettingsProtectedRouteWrapper } from '@/settings/components/SettingsProtectedRouteWrapper';
import { useParams } from 'react-router-dom';
import { PermissionFlagType } from '~/generated-metadata/graphql';
import { SettingsApplicationPreferences } from '~/pages/settings/accounts/SettingsApplicationPreferences';
import { SettingsBuiltInAccountApp } from '~/pages/settings/accounts/SettingsBuiltInAccountApp';
import { SettingsBuiltInMcpClientApp } from '~/pages/settings/accounts/SettingsBuiltInMcpClientApp';

export const SettingsAppPreferencesApp = () => {
  const { applicationId } = useParams<{ applicationId: string }>();

  if (isBuiltInMcpClientAppId(applicationId)) {
    return <SettingsBuiltInMcpClientApp />;
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
