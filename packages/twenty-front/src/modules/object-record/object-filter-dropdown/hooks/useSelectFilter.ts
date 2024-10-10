import { useFilterDropdown } from '@/object-record/object-filter-dropdown/hooks/useFilterDropdown';
import { FilterDefinition } from '@/object-record/object-filter-dropdown/types/FilterDefinition';
import { getInitialFilterValue } from '@/object-record/object-filter-dropdown/utils/getInitialFilterValue';
import { getOperandsForFilterDefinition } from '@/object-record/object-filter-dropdown/utils/getOperandsForFilterType';
import { RelationPickerHotkeyScope } from '@/object-record/relation-picker/types/RelationPickerHotkeyScope';
import { useSetHotkeyScope } from '@/ui/utilities/hotkey/hooks/useSetHotkeyScope';
import { v4 } from 'uuid';

type SelectFilterParams = {
  filterDefinition: FilterDefinition;
};

export const useSelectFilter = () => {
  const {
    setFilterDefinitionUsedInDropdown,
    setSelectedOperandInDropdown,
    setObjectFilterDropdownSearchInput,
    selectFilter: filterDropdownSelectFilter,
  } = useFilterDropdown();

  const setHotkeyScope = useSetHotkeyScope();

  const selectFilter = ({ filterDefinition }: SelectFilterParams) => {
    setFilterDefinitionUsedInDropdown(filterDefinition);

    if (
      filterDefinition.type === 'RELATION' ||
      filterDefinition.type === 'SELECT'
    ) {
      setHotkeyScope(RelationPickerHotkeyScope.RelationPicker);
    }

    setSelectedOperandInDropdown(
      getOperandsForFilterDefinition(filterDefinition)[0],
    );

    const { value, displayValue } = getInitialFilterValue(
      filterDefinition.type,
      getOperandsForFilterDefinition(filterDefinition)[0],
    );

    if (value !== '') {
      filterDropdownSelectFilter({
        id: v4(),
        fieldMetadataId: filterDefinition.fieldMetadataId,
        displayValue,
        operand: getOperandsForFilterDefinition(filterDefinition)[0],
        value,
        definition: filterDefinition,
      });
    }

    setObjectFilterDropdownSearchInput('');
  };

  return {
    selectFilter,
  };
};
