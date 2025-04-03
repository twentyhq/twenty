import { useActionEffect } from '@/action-menu/hooks/useActionEffect';
import { SettingsPath } from '@/types/SettingsPath';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

export const GoToSettingsNoSelectionRecordActionEffect = () => {
  const navigateSettings = useNavigateSettings();

  useActionEffect(() => {
    navigateSettings(SettingsPath.ProfilePage);
  }, [navigateSettings]);

  return null;
};
