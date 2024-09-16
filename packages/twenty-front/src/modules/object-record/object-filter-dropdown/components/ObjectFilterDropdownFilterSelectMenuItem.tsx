import { OBJECT_FILTER_DROPDOWN_ID } from '@/object-record/object-filter-dropdown/constants/ObjectFilterDropdownId';
import { useSelectFilter } from '@/object-record/object-filter-dropdown/hooks/useSelectFilter';
import { FilterDefinition } from '@/object-record/object-filter-dropdown/types/FilterDefinition';
import { FilterType } from '@/object-record/object-filter-dropdown/types/FilterType';
import { hasSubMenuFilter } from '@/object-record/object-filter-dropdown/utils/hasSubMenuFilter';
import { useSelectableList } from '@/ui/layout/selectable-list/hooks/useSelectableList';
import { MenuItemSelect } from '@/ui/navigation/menu-item/components/MenuItemSelect';
import { useRecoilValue } from 'recoil';
import { useIcons } from 'twenty-ui';

export type ObjectFilterDropdownFilterSelectMenuItemProps = {
  filterDefinition: FilterDefinition;
  setCurrentSubMenu: (subMenu: FilterType) => void;
  setCurrentParentFilterDefinition: (
    filterDefinition: FilterDefinition,
  ) => void;
};

export const ObjectFilterDropdownFilterSelectMenuItem = ({
  filterDefinition,
  setCurrentSubMenu,
  setCurrentParentFilterDefinition,
}: ObjectFilterDropdownFilterSelectMenuItemProps) => {
  const { selectFilter } = useSelectFilter();

  const { isSelectedItemIdSelector, resetSelectedItem } = useSelectableList(
    OBJECT_FILTER_DROPDOWN_ID,
  );

  const isSelectedItem = useRecoilValue(
    isSelectedItemIdSelector(filterDefinition.fieldMetadataId),
  );

  const hasSubMenu = hasSubMenuFilter(filterDefinition.type);

  const { getIcon } = useIcons();

  const handleClick = () => {
    resetSelectedItem();

    if (hasSubMenu) {
      setCurrentSubMenu(filterDefinition.type);
      setCurrentParentFilterDefinition(filterDefinition);
    } else {
      selectFilter({ filterDefinition });
    }
  };

  return (
    <MenuItemSelect
      selected={false}
      hovered={isSelectedItem}
      onClick={handleClick}
      LeftIcon={getIcon(filterDefinition.iconName)}
      text={filterDefinition.label}
      hasSubMenu={hasSubMenu}
    />
  );
};
