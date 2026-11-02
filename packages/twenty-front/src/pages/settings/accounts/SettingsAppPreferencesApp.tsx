import { isBuiltInAccountAppId } from '@/settings/app-preferences/utils/isBuiltInAccountAppId';
import { useParams } from 'react-router-dom';
import { SettingsApplicationPreferences } from '~/pages/settings/accounts/SettingsApplicationPreferences';
import { SettingsBuiltInAccountApp } from '~/pages/settings/accounts/SettingsBuiltInAccountApp';

export const SettingsAppPreferencesApp = () => {
  const { applicationId } = useParams<{ applicationId: string }>();

  return isBuiltInAccountAppId(applicationId) ? (
    <SettingsBuiltInAccountApp />
  ) : (
    <SettingsApplicationPreferences />
  );
};
