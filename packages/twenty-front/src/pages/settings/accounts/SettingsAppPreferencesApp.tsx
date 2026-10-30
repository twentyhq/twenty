import { isBuiltInAccountAppId } from '@/settings/app-preferences/utils/isBuiltInAccountAppId';
import { isBuiltInMcpClientAppId } from '@/settings/app-preferences/utils/isBuiltInMcpClientAppId';
import { useParams } from 'react-router-dom';
import { SettingsApplicationPreferences } from '~/pages/settings/accounts/SettingsApplicationPreferences';
import { SettingsBuiltInAccountApp } from '~/pages/settings/accounts/SettingsBuiltInAccountApp';
import { SettingsBuiltInMcpClientApp } from '~/pages/settings/accounts/SettingsBuiltInMcpClientApp';

export const SettingsAppPreferencesApp = () => {
  const { applicationId } = useParams<{ applicationId: string }>();

  if (isBuiltInAccountAppId(applicationId)) {
    return <SettingsBuiltInAccountApp />;
  }

  if (isBuiltInMcpClientAppId(applicationId)) {
    return <SettingsBuiltInMcpClientApp />;
  }

  return <SettingsApplicationPreferences />;
};
