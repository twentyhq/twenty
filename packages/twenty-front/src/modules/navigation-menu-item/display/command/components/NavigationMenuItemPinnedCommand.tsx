import { useCommandMenuItemDisplay } from '@/command-menu-item/display/hooks/useCommandMenuItemDisplay';
import { NavigationMenuItemPinnedCommandActions } from '@/navigation-menu-item/edit/components/NavigationMenuItemPinnedCommandActions';
import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';
import { isNonEmptyArray } from 'twenty-shared/utils';
import { type CommandMenuItemFieldsFragment } from '~/generated-metadata/graphql';

type NavigationMenuItemPinnedCommandProps = {
  navigationMenuItemId: string;
  commandMenuItem: CommandMenuItemFieldsFragment;
  isEditing: boolean;
};

export const NavigationMenuItemPinnedCommand = ({
  navigationMenuItemId,
  commandMenuItem,
  isEditing,
}: NavigationMenuItemPinnedCommandProps) => {
  const { Icon, label, shortLabel, handleClick, disabled } =
    useCommandMenuItemDisplay(commandMenuItem);

  const { hotKeys } = commandMenuItem;

  return (
    <NavigationDrawerItem
      label={shortLabel ?? label}
      Icon={Icon}
      onClick={isEditing || disabled ? undefined : handleClick}
      modifier={
        !isEditing && isNonEmptyArray(hotKeys)
          ? { keyboard: hotKeys.map((hotKey) => [hotKey]) }
          : undefined
      }
      rightOptions={
        isEditing ? (
          <NavigationMenuItemPinnedCommandActions
            navigationMenuItemId={navigationMenuItemId}
          />
        ) : undefined
      }
      triggerEvent="CLICK"
    />
  );
};
