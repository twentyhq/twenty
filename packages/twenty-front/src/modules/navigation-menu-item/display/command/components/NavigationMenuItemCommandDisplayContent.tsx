import { type ReactNode, useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

import { CommandMenuContext } from '@/command-menu-item/contexts/CommandMenuContext';
import { commandMenuItemsSelector } from '@/command-menu-item/states/commandMenuItemsSelector';
import { isLayoutCustomizationModeEnabledState } from '@/layout-customization/states/isLayoutCustomizationModeEnabledState';
import { NavigationMenuItemCommandDrawerItem } from '@/navigation-menu-item/display/command/components/NavigationMenuItemCommandDrawerItem';
import { type EditModeProps } from '@/object-metadata/components/EditModeProps';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

type NavigationMenuItemCommandDisplayContentProps = {
  item: NavigationMenuItem;
  editModeProps?: EditModeProps;
  isDragging: boolean;
  rightOptions?: ReactNode;
};

export const NavigationMenuItemCommandDisplayContent = ({
  item,
  editModeProps,
  isDragging,
  rightOptions,
}: NavigationMenuItemCommandDisplayContentProps) => {
  const isLayoutCustomizationModeEnabled = useAtomStateValue(
    isLayoutCustomizationModeEnabledState,
  );
  const commandMenuItems = useAtomStateValue(commandMenuItemsSelector);
  const { commandMenuItems: availableCommandMenuItems } =
    useContext(CommandMenuContext);

  const commandMenuItem = commandMenuItems.find(
    (commandMenuItem) => commandMenuItem.id === item.commandMenuItemId,
  );
  const isAvailable = availableCommandMenuItems.some(
    (availableCommandMenuItem) =>
      availableCommandMenuItem.id === item.commandMenuItemId,
  );

  if (
    !isDefined(commandMenuItem) ||
    (!isAvailable && !isLayoutCustomizationModeEnabled)
  ) {
    return null;
  }

  return (
    <NavigationMenuItemCommandDrawerItem
      item={item}
      commandMenuItem={commandMenuItem}
      editModeProps={editModeProps}
      isDragging={isDragging}
      rightOptions={rightOptions}
    />
  );
};
