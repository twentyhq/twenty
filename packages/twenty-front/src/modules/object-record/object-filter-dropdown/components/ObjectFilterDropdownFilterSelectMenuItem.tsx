import { useAdvancedFilterDropdown } from '@/object-record/advanced-filter/hooks/useAdvancedFilterDropdown';
import { OBJECT_FILTER_DROPDOWN_ID } from '@/object-record/object-filter-dropdown/constants/ObjectFilterDropdownId';
import { useFilterDropdown } from '@/object-record/object-filter-dropdown/hooks/useFilterDropdown';
import { useSelectFilter } from '@/object-record/object-filter-dropdown/hooks/useSelectFilter';
import { objectFilterDropdownFilterIsSelectedComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownFilterIsSelectedComponentState';
import { objectFilterDropdownFirstLevelFilterDefinitionComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownFirstLevelFilterDefinitionComponentState';
import { objectFilterDropdownIsSelectingCompositeFieldComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownIsSelectingCompositeFieldComponentState';
import { objectFilterDropdownSubMenuFieldTypeComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownSubMenuFieldTypeComponentState';
import { CompositeFilterableFieldType } from '@/object-record/object-filter-dropdown/types/CompositeFilterableFieldType';

import { FilterDefinition } from '@/object-record/object-filter-dropdown/types/FilterDefinition';
import { getOperandsForFilterDefinition } from '@/object-record/object-filter-dropdown/utils/getOperandsForFilterType';
import { isCompositeField } from '@/object-record/object-filter-dropdown/utils/isCompositeField';
import { RelationPickerHotkeyScope } from '@/object-record/relation-picker/types/RelationPickerHotkeyScope';
import { useSelectableList } from '@/ui/layout/selectable-list/hooks/useSelectableList';
import { useSetHotkeyScope } from '@/ui/utilities/hotkey/hooks/useSetHotkeyScope';
import { useRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentStateV2';
import { useRecoilValue } from 'recoil';
import { MenuItemSelect, useIcons } from 'twenty-ui';

export type ObjectFilterDropdownFilterSelectMenuItemProps = {
  filterDefinition: FilterDefinition;
};

export const ObjectFilterDropdownFilterSelectMenuItem = ({
  filterDefinition,
}: ObjectFilterDropdownFilterSelectMenuItemProps) => {
  const { selectFilter } = useSelectFilter();

  const [, setObjectFilterDropdownFirstLevelFilterDefinition] =
    useRecoilComponentStateV2(
      objectFilterDropdownFirstLevelFilterDefinitionComponentState,
    );

  const [, setObjectFilterDropdownSubMenuFieldType] = useRecoilComponentStateV2(
    objectFilterDropdownSubMenuFieldTypeComponentState,
  );

  const [, setObjectFilterDropdownIsSelectingCompositeField] =
    useRecoilComponentStateV2(
      objectFilterDropdownIsSelectingCompositeFieldComponentState,
    );

  const [, setObjectFilterDropdownFilterIsSelected] = useRecoilComponentStateV2(
    objectFilterDropdownFilterIsSelectedComponentState,
  );

  const { isSelectedItemIdSelector, resetSelectedItem } = useSelectableList(
    OBJECT_FILTER_DROPDOWN_ID,
  );

  const isSelectedItem = useRecoilValue(
    isSelectedItemIdSelector(filterDefinition.fieldMetadataId),
  );

  const isACompositeField = isCompositeField(filterDefinition.type);

  const {
    setFilterDefinitionUsedInDropdown,
    setSelectedOperandInDropdown,
    setObjectFilterDropdownSearchInput,
    advancedFilterViewFilterIdState,
  } = useFilterDropdown();

  const setHotkeyScope = useSetHotkeyScope();

  const advancedFilterViewFilterId = useRecoilValue(
    advancedFilterViewFilterIdState,
  );

  const { closeAdvancedFilterDropdown } = useAdvancedFilterDropdown(
    advancedFilterViewFilterId,
  );

  const handleSelectFilter = (availableFilterDefinition: FilterDefinition) => {
    closeAdvancedFilterDropdown();
    selectFilter({ filterDefinition: availableFilterDefinition });

    setFilterDefinitionUsedInDropdown(availableFilterDefinition);

    if (
      availableFilterDefinition.type === 'RELATION' ||
      availableFilterDefinition.type === 'SELECT'
    ) {
      setHotkeyScope(RelationPickerHotkeyScope.RelationPicker);
    }

    setSelectedOperandInDropdown(
      getOperandsForFilterDefinition(availableFilterDefinition)[0],
    );

    setObjectFilterDropdownSearchInput('');

    setObjectFilterDropdownFilterIsSelected(true);
  };

  const { getIcon } = useIcons();

  const handleClick = () => {
    resetSelectedItem();

    if (isACompositeField) {
      // TODO: create isCompositeFilterableFieldType type guard
      setObjectFilterDropdownSubMenuFieldType(
        filterDefinition.type as CompositeFilterableFieldType,
      );
      setObjectFilterDropdownFirstLevelFilterDefinition(filterDefinition);
      setObjectFilterDropdownIsSelectingCompositeField(true);
    } else {
      handleSelectFilter(filterDefinition);
    }
  };

  return (
    <MenuItemSelect
      selected={false}
      hovered={isSelectedItem}
      onClick={handleClick}
      LeftIcon={getIcon(filterDefinition.iconName)}
      text={filterDefinition.label}
      hasSubMenu={isACompositeField}
    />
  );
};
