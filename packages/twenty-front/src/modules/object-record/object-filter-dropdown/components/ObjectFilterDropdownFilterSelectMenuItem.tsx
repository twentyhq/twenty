import { OBJECT_FILTER_DROPDOWN_ID } from '@/object-record/object-filter-dropdown/constants/ObjectFilterDropdownId';
import { useSelectFilter } from '@/object-record/object-filter-dropdown/hooks/useSelectFilter';

import { FilterDefinition } from '@/object-record/object-filter-dropdown/types/FilterDefinition';
import { useSelectableList } from '@/ui/layout/selectable-list/hooks/useSelectableList';
import { MenuItemSelect } from '@/ui/navigation/menu-item/components/MenuItemSelect';
import { useRecoilValue } from 'recoil';
import { useIcons } from 'twenty-ui';

export type ObjectFilterDropdownFilterSelectMenuItemProps = {
  filterDefinition: FilterDefinition;
};

export const ObjectFilterDropdownFilterSelectMenuItem = ({
  filterDefinition,
}: ObjectFilterDropdownFilterSelectMenuItemProps) => {
  const { selectFilter } = useSelectFilter();

  const { isSelectedItemIdSelector, resetSelectedItem } = useSelectableList(
    OBJECT_FILTER_DROPDOWN_ID,
  );

  const isSelectedItem = useRecoilValue(
    isSelectedItemIdSelector(filterDefinition.fieldMetadataId),
  );

  const { getIcon } = useIcons();

  const handleClick = () => {
    resetSelectedItem();

    selectFilter({ filterDefinition });
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
