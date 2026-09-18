import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { isSelectedItemIdComponentFamilyState } from '@/ui/layout/selectable-list/states/isSelectedItemIdComponentFamilyState';
import { useAtomComponentFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateValue';
import { useLingui } from '@lingui/react/macro';
import { type ReactNode } from 'react';
import { MenuItem } from 'twenty-ui/components';
import { type IconComponent } from 'twenty-ui/icon';
export type NavigationMenuItemOption = {
  id: string;
  label: string;
  searchableValues?: string[];
  contextualText?: string;
  Icon?: IconComponent;
  icon?: ReactNode;
  onClick: () => void;
  isDisabled?: boolean;
  isAlreadyInSidebar?: boolean;
  hasSubMenu?: boolean;
  accent?: 'default' | 'danger';
};
type NavigationMenuItemSelectableItemProps = { item: NavigationMenuItemOption };

export const NavigationMenuItemSelectableItem = ({
  item,
}: NavigationMenuItemSelectableItemProps) => {
  const { t } = useLingui();
  const isSelectedItemId = useAtomComponentFamilyStateValue(
    isSelectedItemIdComponentFamilyState,
    item.id,
  );
  return (
    <SelectableListItem
      itemId={item.id}
      onEnter={item.isDisabled ? undefined : item.onClick}
    >
      <MenuItem
        text={item.label}
        accent={item.accent}
        LeftIcon={item.Icon}
        LeftComponent={item.icon}
        onClick={item.onClick}
        disabled={item.isDisabled}
        contextualText={
          item.isAlreadyInSidebar ? t`Already in sidebar` : item.contextualText
        }
        contextualTextPosition="left"
        hasSubMenu={item.hasSubMenu}
        focused={isSelectedItemId}
      />
    </SelectableListItem>
  );
};
