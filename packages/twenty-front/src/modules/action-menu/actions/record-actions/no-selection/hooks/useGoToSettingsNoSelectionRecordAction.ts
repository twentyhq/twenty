import { ActionHookWithoutObjectMetadataItem } from '@/action-menu/actions/types/ActionHook';
import { SettingsPath } from '@/types/SettingsPath';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

export const useGoToSettingsNoSelectionRecordAction: ActionHookWithoutObjectMetadataItem =
  () => {
    const navigateSettings = useNavigateSettings();

    const shouldBeRegistered = true;

    const onClick = () => {
      navigateSettings(SettingsPath.ProfilePage);
    };

    return {
      shouldBeRegistered,
      onClick,
    };
  };
