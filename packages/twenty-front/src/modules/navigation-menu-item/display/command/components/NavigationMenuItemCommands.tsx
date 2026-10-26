import { isDefined } from 'twenty-shared/utils';
import { useIsMobile } from 'twenty-ui/utilities';

import { isLayoutCustomizationModeEnabledState } from '@/layout-customization/states/isLayoutCustomizationModeEnabledState';
import { getNavigationMenuItemCommandKey } from '@/navigation-menu-item/common/utils/getNavigationMenuItemCommandKey';
import { useNavigationMenuItemCommandRunner } from '@/navigation-menu-item/display/command/hooks/useNavigationMenuItemCommandRunner';
import { useNavigationMenuItemCommands } from '@/navigation-menu-item/display/command/hooks/useNavigationMenuItemCommands';
import { WorkspaceSectionContainer } from '@/navigation-menu-item/display/sections/workspace/components/WorkspaceSectionContainer';
import { useWorkspaceSectionItemClickHandlers } from '@/navigation-menu-item/display/sections/workspace/hooks/useWorkspaceSectionItemClickHandlers';
import { NavigationMenuItemAddCommandButton } from '@/navigation-menu-item/edit/components/NavigationMenuItemAddCommandButton';
import { NavigationDrawerSection } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSection';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

type NavigationMenuItemCommandsProps = {
  parentId: string | null;
};

export const NavigationMenuItemCommands = ({
  parentId,
}: NavigationMenuItemCommandsProps) => {
  const isMobile = useIsMobile();
  const isLayoutCustomizationModeEnabled = useAtomStateValue(
    isLayoutCustomizationModeEnabledState,
  );
  const { commandsContainer, commandItems } =
    useNavigationMenuItemCommands(parentId);
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
    <NavigationMenuItemAddCommandButton
      parentId={parentId}
      commandItems={commandItems}
    />
  ) : undefined;

  if (!isDefined(commandsContainer) || visibleCommandItems.length === 0) {
    return isDefined(addCommandButton) ? (
      <NavigationDrawerSection>{addCommandButton}</NavigationDrawerSection>
    ) : null;
  }

  return (
    <WorkspaceSectionContainer
      sectionTitle=""
      items={visibleCommandItems}
      containerId={commandsContainer.id}
      navigationSectionId={`navigation-menu-commands-${commandsContainer.id}`}
      isTitleHidden
      addMenuItemButton={addCommandButton}
      selectedNavigationMenuItemId={selectedNavigationMenuItemId}
      onNavigationMenuItemClick={onNavigationMenuItemClick}
      onActiveObjectMetadataItemClick={onActiveObjectMetadataItemClick}
    />
  );
};
