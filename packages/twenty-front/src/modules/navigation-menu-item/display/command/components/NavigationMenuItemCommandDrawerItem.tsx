import { type ReactNode } from 'react';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

import { useCommandMenuItemDisplay } from '@/command-menu-item/display/hooks/useCommandMenuItemDisplay';
import { type CommandMenuItemDefinition } from '@/command-menu-item/types/CommandMenuItemDefinition';
import { isLayoutCustomizationModeEnabledState } from '@/layout-customization/states/isLayoutCustomizationModeEnabledState';
import { type EditModeProps } from '@/object-metadata/components/EditModeProps';
import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

type NavigationMenuItemCommandDrawerItemProps = {
  item: NavigationMenuItem;
  commandMenuItem: CommandMenuItemDefinition;
  editModeProps?: EditModeProps;
  isDragging: boolean;
  rightOptions?: ReactNode;
};

export const NavigationMenuItemCommandDrawerItem = ({
  item,
  commandMenuItem,
  editModeProps,
  isDragging,
  rightOptions,
}: NavigationMenuItemCommandDrawerItemProps) => {
  const isLayoutCustomizationModeEnabled = useAtomStateValue(
    isLayoutCustomizationModeEnabledState,
  );
  const { Icon, label, handleClick } =
    useCommandMenuItemDisplay(commandMenuItem);

  return (
    <NavigationDrawerItem
      label={item.name ?? label}
      Icon={Icon}
      onClick={
        isLayoutCustomizationModeEnabled
          ? editModeProps?.onEditModeClick
          : () => void handleClick()
      }
      isSelectedInEditMode={editModeProps?.isSelectedInEditMode}
      isDragging={isDragging}
      triggerEvent="CLICK"
      rightOptions={rightOptions}
    />
  );
};
