import { OBJECT_FILTER_DROPDOWN_ID } from '@/object-record/object-filter-dropdown/constants/ObjectFilterDropdownId';
import { useFilterDropdown } from '@/object-record/object-filter-dropdown/hooks/useFilterDropdown';
import { useHandleClick } from '@/object-record/object-filter-dropdown/hooks/useHandleClick';
import { FilterDefinition } from '@/object-record/object-filter-dropdown/types/FilterDefinition';
import { getOperandsForFilterType } from '@/object-record/object-filter-dropdown/utils/getOperandsForFilterType';
import { RelationPickerHotkeyScope } from '@/object-record/relation-picker/types/RelationPickerHotkeyScope';
import { useSelectableList } from '@/ui/layout/selectable-list/hooks/useSelectableList';
import { MenuItemSelect } from '@/ui/navigation/menu-item/components/MenuItemSelect';
import { useSetHotkeyScope } from '@/ui/utilities/hotkey/hooks/useSetHotkeyScope';
import { useRecoilValue } from 'recoil';
import { useIcons } from 'twenty-ui';

export type ObjectFilterDropdownFilterSelectMenuItemProps = {
  filterDefinition: FilterDefinition;
};

export const ObjectFilterDropdownFilterSelectMenuItem = ({
  filterDefinition,
}: ObjectFilterDropdownFilterSelectMenuItemProps) => {
  const { handleClick } = useHandleClick();
  const { isSelectedItemIdSelector } = useSelectableList(
    OBJECT_FILTER_DROPDOWN_ID,
  );

  const isSelectedItem = useRecoilValue(
    isSelectedItemIdSelector(filterDefinition.fieldMetadataId),
  );

  const { getIcon } = useIcons();

  return (
    <MenuItemSelect
      selected={false}
      hovered={isSelectedItem}
      onClick={() => handleClick({ filterDefinition })}
      LeftIcon={getIcon(filterDefinition.iconName)}
      text={filterDefinition.label}
    />
  );
};
