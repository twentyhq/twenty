import { isNonEmptyArray } from 'twenty-shared/utils';
import { type ReactElement, Fragment } from 'react';
import { Dropdown } from 'twenty-ui/components/navigation';

import { NavigationMenuItemSelectableItem } from '@/navigation-menu-item/edit/components/NavigationMenuItemSelectableItem';
import { type NavigationMenuItemOption } from '@/navigation-menu-item/edit/types/NavigationMenuItemOption';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';

type NavigationMenuItemContainerTemplateMenuGroup = {
  id: string;
  label?: string;
  options: NavigationMenuItemOption[];
};

type NavigationMenuItemContainerTemplateMenuProps = {
  dropdownId: string;
  title: string;
  trigger: ReactElement;
  isTriggerNativeButton?: boolean;
  side?: 'right' | 'bottom';
  groups: NavigationMenuItemContainerTemplateMenuGroup[];
};

export const NavigationMenuItemContainerTemplateMenu = ({
  dropdownId,
  title,
  trigger,
  isTriggerNativeButton = true,
  side = 'right',
  groups,
}: NavigationMenuItemContainerTemplateMenuProps) => (
  <DropdownRoot dropdownId={dropdownId} type="menu">
    <Dropdown.Trigger nativeButton={isTriggerNativeButton} render={trigger} />
    <DropdownContent
      side={side}
      align="start"
      width={GenericDropdownContentWidth.ExtraLarge}
      aria-label={title}
    >
      {groups
        .filter((group) => isNonEmptyArray(group.options))
        .map((group, index) => (
          <Fragment key={group.id}>
            {index > 0 && <Dropdown.Separator />}
            <Dropdown.Section label={group.label}>
              {group.options.map((option) => (
                <NavigationMenuItemSelectableItem
                  key={option.id}
                  item={option}
                />
              ))}
            </Dropdown.Section>
          </Fragment>
        ))}
    </DropdownContent>
  </DropdownRoot>
);
