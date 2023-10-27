import { RelationPickerHotkeyScope } from '@/ui/input/relation-picker/types/RelationPickerHotkeyScope';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { MenuItem } from '@/ui/navigation/menu-item/components/MenuItem';
import { useSetHotkeyScope } from '@/ui/utilities/hotkey/hooks/useSetHotkeyScope';

import { useFilter } from '../hooks/useFilter';
import { getOperandsForFilterType } from '../utils/getOperandsForFilterType';

export const FilterDropdownFilterSelect = () => {
  const {
    setFilterDefinitionUsedInDropdown,
    setSelectedOperandInDropdown,
    setFilterDropdownSearchInput,
    availableFilters,
  } = useFilter();

  const setHotkeyScope = useSetHotkeyScope();

  return (
    <DropdownMenuItemsContainer>
      {availableFilters.map((availableFilter, index) => (
        <MenuItem
          key={`select-filter-${index}`}
          testId={`select-filter-${index}`}
          onClick={() => {
            setFilterDefinitionUsedInDropdown(availableFilter);

            if (availableFilter.type === 'entity') {
              setHotkeyScope(RelationPickerHotkeyScope.RelationPicker);
            }

            setSelectedOperandInDropdown(
              getOperandsForFilterType(availableFilter.type)?.[0],
            );

            setFilterDropdownSearchInput('');
          }}
          LeftIcon={availableFilter.Icon}
          text={availableFilter.label}
        />
      ))}
    </DropdownMenuItemsContainer>
  );
};
