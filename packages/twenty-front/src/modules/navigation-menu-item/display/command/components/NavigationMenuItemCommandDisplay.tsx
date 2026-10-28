import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';

import { isLayoutCustomizationModeEnabledState } from '@/layout-customization/states/isLayoutCustomizationModeEnabledState';
import { NAVIGATION_MENU_ITEM_COMMANDS } from '@/navigation-menu-item/common/constants/NavigationMenuItemCommands';
import { getNavigationMenuItemCommandKey } from '@/navigation-menu-item/common/utils/getNavigationMenuItemCommandKey';
import { useNavigationMenuItemCommandRunner } from '@/navigation-menu-item/display/command/hooks/useNavigationMenuItemCommandRunner';
import type { NavigationMenuItemSectionContentProps } from '@/navigation-menu-item/display/sections/types/NavigationMenuItemSectionContentProps';
import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

type NavigationMenuItemCommandDisplayProps =
  NavigationMenuItemSectionContentProps;

export const NavigationMenuItemCommandDisplay = ({
  item,
  editModeProps,
  isDragging,
  rightOptions,
}: NavigationMenuItemCommandDisplayProps) => {
  const { t } = useLingui();
  const isLayoutCustomizationModeEnabled = useAtomStateValue(
    isLayoutCustomizationModeEnabledState,
  );
  const { runCommand } = useNavigationMenuItemCommandRunner();
  const commandKey = getNavigationMenuItemCommandKey(item);

  if (!isDefined(commandKey)) {
    return null;
  }

  const { label, Icon, shortcut } = NAVIGATION_MENU_ITEM_COMMANDS[commandKey];

  return (
    <NavigationDrawerItem
      label={t(label)}
      Icon={Icon}
      modifier={
        isDefined(shortcut) && !isLayoutCustomizationModeEnabled
          ? { keyboard: shortcut }
          : undefined
      }
      onClick={
        isLayoutCustomizationModeEnabled
          ? editModeProps?.onEditModeClick
          : () => runCommand(commandKey)
      }
      isSelectedInEditMode={editModeProps?.isSelectedInEditMode}
      isDragging={isDragging}
      triggerEvent="CLICK"
      rightOptions={rightOptions}
    />
  );
};
