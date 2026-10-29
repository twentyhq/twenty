import { BUILT_IN_ACCOUNT_APPS } from '@/settings/app-preferences/constants/BuiltInAccountApps';
import { useParams } from 'react-router-dom';
import { SettingsApplicationPreferences } from '~/pages/settings/accounts/SettingsApplicationPreferences';
import { SettingsBuiltInAccountApp } from '~/pages/settings/accounts/SettingsBuiltInAccountApp';

export const SettingsAppPreferencesApp = () => {
  const { appId } = useParams<{ appId: string }>();

  const isBuiltInAccountApp = BUILT_IN_ACCOUNT_APPS.some(
    (builtInAccountApp) => builtInAccountApp.id === appId,
  );

  return isBuiltInAccountApp ? (
    <SettingsBuiltInAccountApp />
  ) : (
    <SettingsApplicationPreferences />
  );
};
