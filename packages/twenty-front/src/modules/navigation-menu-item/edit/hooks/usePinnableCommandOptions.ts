import { STANDARD_PINNABLE_COMMAND_MENU_ITEM_UNIVERSAL_IDENTIFIERS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';
import { useIcons } from 'twenty-ui/icon/provider';

import { commandMenuItemsSelector } from '@/command-menu-item/states/commandMenuItemsSelector';
import { usePinnedCommandsEdit } from '@/navigation-menu-item/edit/hooks/usePinnedCommandsEdit';
import { type NavigationMenuItemOption } from '@/navigation-menu-item/edit/types/NavigationMenuItemOption';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const usePinnableCommandOptions = (): NavigationMenuItemOption[] => {
  const { getIcon } = useIcons();
  const commandMenuItems = useAtomStateValue(commandMenuItemsSelector);
  const { isPinned, pin } = usePinnedCommandsEdit();

  return Object.values(
    STANDARD_PINNABLE_COMMAND_MENU_ITEM_UNIVERSAL_IDENTIFIERS,
  ).flatMap((universalIdentifier) => {
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
        isDisabled: isAlreadyInSidebar,
        onClick: () => pin(commandMenuItem.id),
      },
    ];
  });
};
