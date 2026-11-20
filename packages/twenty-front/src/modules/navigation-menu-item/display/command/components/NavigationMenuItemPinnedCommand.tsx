import { useCommandMenuItemDisplay } from '@/command-menu-item/display/hooks/useCommandMenuItemDisplay';
import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';
import { isNonEmptyArray } from 'twenty-shared/utils';
import { type CommandMenuItemFieldsFragment } from '~/generated-metadata/graphql';

type NavigationMenuItemPinnedCommandProps = {
  commandMenuItem: CommandMenuItemFieldsFragment;
};

export const NavigationMenuItemPinnedCommand = ({
  commandMenuItem,
}: NavigationMenuItemPinnedCommandProps) => {
  const { Icon, label, shortLabel, handleClick, disabled } =
    useCommandMenuItemDisplay(commandMenuItem);

  const { hotKeys } = commandMenuItem;

  return (
    <NavigationDrawerItem
      label={shortLabel ?? label}
      Icon={Icon}
      onClick={disabled ? undefined : handleClick}
      modifier={
        isNonEmptyArray(hotKeys)
          ? { keyboard: hotKeys.map((hotKey) => [hotKey]) }
          : undefined
      }
      triggerEvent="CLICK"
    />
  );
};
