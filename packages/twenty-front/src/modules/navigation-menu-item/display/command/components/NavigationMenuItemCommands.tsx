import { isDefined } from 'twenty-shared/utils';
import { useIsMobile } from 'twenty-ui/utilities';

import { isLayoutCustomizationModeEnabledState } from '@/layout-customization/states/isLayoutCustomizationModeEnabledState';
import { isNavigationMenuItemPinnedCommands } from '@/navigation-menu-item/common/utils/isNavigationMenuItemPinnedCommands';
import { getNavigationMenuItemCommandKey } from '@/navigation-menu-item/common/utils/getNavigationMenuItemCommandKey';
import { useNavigationMenuItemCommandRunner } from '@/navigation-menu-item/display/command/hooks/useNavigationMenuItemCommandRunner';
import { useNavigationMenuItemsData } from '@/navigation-menu-item/display/hooks/useNavigationMenuItemsData';
import { useNavigationMenuItemsInContainers } from '@/navigation-menu-item/display/hooks/useNavigationMenuItemsInContainers';
import { WorkspaceSectionContainer } from '@/navigation-menu-item/display/sections/workspace/components/WorkspaceSectionContainer';
import { useWorkspaceSectionItemClickHandlers } from '@/navigation-menu-item/display/sections/workspace/hooks/useWorkspaceSectionItemClickHandlers';
import { NavigationMenuItemAddCommandButton } from '@/navigation-menu-item/edit/components/NavigationMenuItemAddCommandButton';
import { NavigationDrawerSection } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSection';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const NavigationMenuItemCommands = () => {
  const isMobile = useIsMobile();
  const isLayoutCustomizationModeEnabled = useAtomStateValue(
    isLayoutCustomizationModeEnabledState,
  );
  const { workspaceNavigationMenuItems } = useNavigationMenuItemsData();
  const pinnedCommandsContainer = workspaceNavigationMenuItems.find(
    isNavigationMenuItemPinnedCommands,
  );
  const commandItems = useNavigationMenuItemsInContainers(
    isDefined(pinnedCommandsContainer) ? [pinnedCommandsContainer.id] : [],
  );
  const { isCommandAvailable } = useNavigationMenuItemCommandRunner();
  const {
    selectedNavigationMenuItemId,
    onNavigationMenuItemClick,
    onActiveObjectMetadataItemClick,
  } = useWorkspaceSectionItemClickHandlers();

  const isEditable = isLayoutCustomizationModeEnabled && !isMobile;
  const visibleCommandItems = isEditable
    ? commandItems
    : commandItems.filter((item) => {
        const commandKey = getNavigationMenuItemCommandKey(item);

        return isDefined(commandKey) && isCommandAvailable(commandKey);
      });
  const addCommandButton = isEditable ? (
    <NavigationMenuItemAddCommandButton commandItems={commandItems} />
  ) : undefined;

  if (!isDefined(pinnedCommandsContainer) || visibleCommandItems.length === 0) {
    return isDefined(addCommandButton) ? (
      <NavigationDrawerSection>{addCommandButton}</NavigationDrawerSection>
    ) : null;
  }

  return (
    <WorkspaceSectionContainer
      sectionTitle=""
      items={visibleCommandItems}
      containerId={pinnedCommandsContainer.id}
      navigationSectionId={`navigation-menu-commands-${pinnedCommandsContainer.id}`}
      isTitleHidden
      addMenuItemButton={addCommandButton}
      selectedNavigationMenuItemId={selectedNavigationMenuItemId}
      onNavigationMenuItemClick={onNavigationMenuItemClick}
      onActiveObjectMetadataItemClick={onActiveObjectMetadataItemClick}
    />
  );
};
