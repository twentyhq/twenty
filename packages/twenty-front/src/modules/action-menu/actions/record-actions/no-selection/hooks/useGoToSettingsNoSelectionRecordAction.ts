import { ActionHookWithoutObjectMetadataItem } from '@/action-menu/actions/types/ActionHook';
import { SettingsPath } from '@/types/SettingsPath';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

export const useGoToSettingsNoSelectionRecordAction: ActionHookWithoutObjectMetadataItem =
  () => {
    const navigateSettings = useNavigateSettings();

    const onClick = () => {
      navigateSettings(SettingsPath.ProfilePage);
    };

    return {
      onClick,
    };
  };
