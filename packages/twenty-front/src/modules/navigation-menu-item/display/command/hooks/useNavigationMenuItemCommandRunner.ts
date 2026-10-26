import {
  type NavigationMenuItemCommandKey,
  SettingsPath,
} from 'twenty-shared/types';
import { PermissionFlagType } from '~/generated-metadata/graphql';

import { useSwitchToNewAiChat } from '@/ai/hooks/useSwitchToNewAiChat';
import { useCreateCoreAgent } from '@/object-core/agents/hooks/useCreateCoreAgent';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { useOpenRecordsSearchPageInSidePanel } from '@/side-panel/hooks/useOpenRecordsSearchPageInSidePanel';
import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

export const useNavigationMenuItemCommandRunner = () => {
  const hasAiPermission = useHasPermissionFlag(PermissionFlagType.AI);
  const { switchToNewChat } = useSwitchToNewAiChat({
    shouldOpenInFullPage: true,
  });
  const { openRecordsSearchPage } = useOpenRecordsSearchPageInSidePanel();
  const { createCoreAgent, canCreateCoreAgent } = useCreateCoreAgent();
  const navigateSettings = useNavigateSettings();
  const { openSidePanelMenu } = useSidePanelMenu();

  const isCommandAvailable = (commandKey: NavigationMenuItemCommandKey) => {
    switch (commandKey) {
      case 'NEW_CHAT':
        return hasAiPermission;
      case 'NEW_AGENT':
        return canCreateCoreAgent;
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
      case 'NEW_AGENT':
        void createCoreAgent();
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
