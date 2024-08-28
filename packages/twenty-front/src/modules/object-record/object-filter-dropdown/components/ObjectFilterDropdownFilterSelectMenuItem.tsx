import { OBJECT_FILTER_DROPDOWN_ID } from '@/object-record/object-filter-dropdown/constants/ObjectFilterDropdownId';
import { useFilterDropdown } from '@/object-record/object-filter-dropdown/hooks/useFilterDropdown';
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
  const {
    setFilterDefinitionUsedInDropdown,
    setSelectedOperandInDropdown,
    setObjectFilterDropdownSearchInput,
  } = useFilterDropdown();

  const { isSelectedItemIdSelector } = useSelectableList(
    OBJECT_FILTER_DROPDOWN_ID,
  );

  const isSelectedItem = useRecoilValue(
    isSelectedItemIdSelector(filterDefinition.fieldMetadataId),
  );

  const { getIcon } = useIcons();

  const setHotkeyScope = useSetHotkeyScope();

  const handleClick = () => {
    setFilterDefinitionUsedInDropdown(filterDefinition);

    if (
      filterDefinition.type === 'RELATION' ||
      filterDefinition.type === 'SELECT'
    ) {
      setHotkeyScope(RelationPickerHotkeyScope.RelationPicker);
    }

    setSelectedOperandInDropdown(
      getOperandsForFilterType(filterDefinition.type)?.[0],
    );

    setObjectFilterDropdownSearchInput('');
  };

  return (
    <MenuItemSelect
      selected={false}
      hovered={isSelectedItem}
      onClick={handleClick}
      LeftIcon={getIcon(filterDefinition.iconName)}
      text={filterDefinition.label}
    />
  );
};
