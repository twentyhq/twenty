import { SettingsPath } from '@/types/SettingsPath';
import { useEffect } from 'react';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

export const GoToSettingsNoSelectionRecordActionEffect = () => {
  const navigateSettings = useNavigateSettings();

  useEffect(() => {
    navigateSettings(SettingsPath.ProfilePage);
  }, [navigateSettings]);

  return null;
};
