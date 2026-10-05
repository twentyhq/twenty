import { useLingui } from '@lingui/react/macro';
import { Dropdown } from 'twenty-ui/components';

import { type NavigationMenuItemOption } from '@/navigation-menu-item/edit/types/NavigationMenuItemOption';
import { SelectOptionIcon } from '@/ui/input/components/SelectOptionIcon';

type NavigationMenuItemSelectableItemProps = { item: NavigationMenuItemOption };

export const NavigationMenuItemSelectableItem = ({
  item,
}: NavigationMenuItemSelectableItemProps) => {
  const { t } = useLingui();

  return (
    <Dropdown.OptionItem
      color={item.accent === 'danger' ? 'danger' : 'neutral'}
      startIcon={
        <>
          <SelectOptionIcon Icon={item.Icon} />
          {item.icon}
        </>
      }
      onSelect={item.onClick}
      closeOnSelect={!item.hasSubMenu}
      disabled={item.isDisabled}
      description={
        item.isAlreadyInSidebar ? t`Already in sidebar` : item.contextualText
      }
      hasSubmenu={item.hasSubMenu}
    >
      {item.label}
    </Dropdown.OptionItem>
  );
};
