import { useLingui } from '@lingui/react/macro';
import { Dropdown } from 'twenty-ui/components/navigation';
import { IconPlus } from 'twenty-ui/icon';

import { NavigationMenuItemSelectableItem } from '@/navigation-menu-item/edit/components/NavigationMenuItemSelectableItem';
import { usePinnableCommandOptions } from '@/navigation-menu-item/edit/hooks/usePinnableCommandOptions';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';

export const NavigationMenuItemPinnedCommandAddButton = () => {
  const { t } = useLingui();
  const pinnableCommandOptions = usePinnableCommandOptions();

  return (
    <DropdownRoot dropdownId="navigation-add-pinned-command" type="picker">
      <Dropdown.Trigger
        nativeButton={false}
        render={
          <div tabIndex={-1}>
            <NavigationDrawerItem
              Icon={IconPlus}
              label={t`Add command`}
              triggerEvent="CLICK"
              variant="tertiary"
            />
          </div>
        }
      />
      <DropdownContent
        side="right"
        align="start"
        width={GenericDropdownContentWidth.Large}
      >
        <Dropdown.Section>
          {pinnableCommandOptions.map((option) => (
            <NavigationMenuItemSelectableItem key={option.id} item={option} />
          ))}
        </Dropdown.Section>
      </DropdownContent>
    </DropdownRoot>
  );
};
