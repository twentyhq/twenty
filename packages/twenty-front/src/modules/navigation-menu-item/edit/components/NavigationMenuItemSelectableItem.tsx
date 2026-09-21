import { DropdownListItem } from '@/ui/layout/dropdown/components/DropdownListItem';
import { SelectOptionIcon } from '@/ui/input/components/SelectOptionIcon';
import { type ReactNode } from 'react';
import { type IconComponent } from 'twenty-ui/icon';
import { useLingui } from '@lingui/react/macro';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { isSelectedItemIdComponentFamilyState } from '@/ui/layout/selectable-list/states/isSelectedItemIdComponentFamilyState';
import { useAtomComponentFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateValue';
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
      <DropdownListItem
        color={item.accent === 'danger' ? 'danger' : 'neutral'}
        startIcon={
          <>
            <SelectOptionIcon Icon={item.Icon} />
            {item.icon}
          </>
        }
        onClick={item.onClick}
        disabled={item.isDisabled}
        description={
          item.isAlreadyInSidebar ? t`Already in sidebar` : item.contextualText
        }
        hasSubmenu={item.hasSubMenu}
        focused={isSelectedItemId}
      >
        {item.label}
      </DropdownListItem>
    </SelectableListItem>
  );
};
