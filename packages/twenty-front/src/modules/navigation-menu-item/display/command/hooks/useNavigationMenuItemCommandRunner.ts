import {
  type NavigationMenuItemCommandKey,
  SettingsPath,
} from 'twenty-shared/types';
import { PermissionFlagType } from '~/generated-metadata/graphql';

import { useSwitchToNewAiChat } from '@/ai/hooks/useSwitchToNewAiChat';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { useOpenRecordsSearchPageInSidePanel } from '@/side-panel/hooks/useOpenRecordsSearchPageInSidePanel';
import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

export const useNavigationMenuItemCommandRunner = () => {
  const hasAiPermission = useHasPermissionFlag(PermissionFlagType.AI);
  const { switchToNewChat } = useSwitchToNewAiChat();
  const { openRecordsSearchPage } = useOpenRecordsSearchPageInSidePanel();
  const navigateSettings = useNavigateSettings();
  const { openSidePanelMenu } = useSidePanelMenu();

  const isCommandAvailable = (commandKey: NavigationMenuItemCommandKey) => {
    switch (commandKey) {
      case 'NEW_CHAT':
        return hasAiPermission;
      default:
        return true;
    }
  };

  const runCommand = (commandKey: NavigationMenuItemCommandKey) => {
    switch (commandKey) {
      case 'NEW_CHAT':
        switchToNewChat();
        break;
      case 'SEARCH':
        openRecordsSearchPage();
        break;
      case 'SETTINGS':
        navigateSettings(SettingsPath.ProfilePage);
        break;
      case 'ALL_COMMANDS':
        openSidePanelMenu();
        break;
    }
  };

  return { isCommandAvailable, runCommand };
};
