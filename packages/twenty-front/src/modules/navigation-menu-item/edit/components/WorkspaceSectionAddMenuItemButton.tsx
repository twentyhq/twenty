import { useLingui } from '@lingui/react/macro';
import { IconPlus } from 'twenty-ui/icon';
import { NavigationMenuItemEntrance } from '@/navigation-menu-item/edit/components/NavigationMenuItemEntrance';
import { NavigationMenuItemAddDropdown } from '@/navigation-menu-item/edit/components/NavigationMenuItemAddDropdown';
import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';

export const WorkspaceSectionAddMenuItemButton = () => {
  const { t } = useLingui();
  return (
    <NavigationMenuItemEntrance>
      <NavigationMenuItemAddDropdown>
        <NavigationDrawerItem
          Icon={IconPlus}
          label={t`Add menu item`}
          triggerEvent="CLICK"
          variant="tertiary"
        />
      </NavigationMenuItemAddDropdown>
    </NavigationMenuItemEntrance>
  );
};
