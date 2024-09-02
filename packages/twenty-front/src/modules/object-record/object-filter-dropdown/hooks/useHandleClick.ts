import { useFilterDropdown } from '@/object-record/object-filter-dropdown/hooks/useFilterDropdown';
import { FilterDefinition } from '@/object-record/object-filter-dropdown/types/FilterDefinition';
import { getOperandsForFilterType } from '@/object-record/object-filter-dropdown/utils/getOperandsForFilterType';
import { RelationPickerHotkeyScope } from '@/object-record/relation-picker/types/RelationPickerHotkeyScope';
import { useSetHotkeyScope } from '@/ui/utilities/hotkey/hooks/useSetHotkeyScope';

type HandleClickParams = {
  filterDefinition: FilterDefinition;
};
export const useHandleClick = () => {
  const {
    setFilterDefinitionUsedInDropdown,
    setSelectedOperandInDropdown,
    setObjectFilterDropdownSearchInput,
  } = useFilterDropdown();
  const setHotkeyScope = useSetHotkeyScope();
  const handleClick = ({ filterDefinition }: HandleClickParams) => {
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
  return {
    handleClick,
  };
};
