import { isDefined } from 'twenty-shared/utils';
import { useIcons } from 'twenty-ui/icon/provider';

import { CommandMenuContext } from '@/command-menu-item/contexts/CommandMenuContext';
import { PINNABLE_COMMAND_MENU_ITEM_UNIVERSAL_IDENTIFIERS } from '@/navigation-menu-item/common/constants/PinnableCommandMenuItemUniversalIdentifiers';
import { usePinnedCommandsEdit } from '@/navigation-menu-item/edit/hooks/usePinnedCommandsEdit';
import { type NavigationMenuItemOption } from '@/navigation-menu-item/edit/types/NavigationMenuItemOption';
import { useContext } from 'react';

export const usePinnableCommandOptions = (): NavigationMenuItemOption[] => {
  const { getIcon } = useIcons();
  const { commandMenuItems } = useContext(CommandMenuContext);
  const { isPinned, pin } = usePinnedCommandsEdit();

  return PINNABLE_COMMAND_MENU_ITEM_UNIVERSAL_IDENTIFIERS.flatMap(
    (universalIdentifier) => {
      const commandMenuItem = commandMenuItems.find(
        (candidate) => candidate.universalIdentifier === universalIdentifier,
      );

      if (!isDefined(commandMenuItem)) {
        return [];
      }

      const isAlreadyInSidebar = isPinned(commandMenuItem.id);

      return [
        {
          id: commandMenuItem.id,
          label: commandMenuItem.shortLabel ?? commandMenuItem.label,
          Icon: getIcon(commandMenuItem.icon),
          isAlreadyInSidebar,
          onClick: () => pin(commandMenuItem.id),
        },
      ];
    },
  );
};
