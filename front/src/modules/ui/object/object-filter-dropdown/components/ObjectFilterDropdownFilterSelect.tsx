import { RelationPickerHotkeyScope } from '@/ui/input/relation-picker/types/RelationPickerHotkeyScope';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { MenuItem } from '@/ui/navigation/menu-item/components/MenuItem';
import { useSetHotkeyScope } from '@/ui/utilities/hotkey/hooks/useSetHotkeyScope';

import { useFilter } from '../hooks/useFilter';
import { getOperandsForFilterType } from '../utils/getOperandsForFilterType';

export const ObjectFilterDropdownFilterSelect = () => {
  const {
    setFilterDefinitionUsedInDropdown,
    setSelectedOperandInDropdown,
    setObjectFilterDropdownSearchInput,
    availableFilterDefinitions,
  } = useFilter();

  const setHotkeyScope = useSetHotkeyScope();

  return (
    <DropdownMenuItemsContainer>
      {availableFilterDefinitions.map((availableFilterDefinition, index) => (
        <MenuItem
          key={`select-filter-${index}`}
          testId={`select-filter-${index}`}
          onClick={() => {
            setFilterDefinitionUsedInDropdown(availableFilterDefinition);

            if (availableFilterDefinition.type === 'ENTITY') {
              setHotkeyScope(RelationPickerHotkeyScope.RelationPicker);
            }

            setSelectedOperandInDropdown(
              getOperandsForFilterType(availableFilterDefinition.type)?.[0],
            );

            setObjectFilterDropdownSearchInput('');
          }}
          LeftIcon={availableFilterDefinition.Icon}
          text={availableFilterDefinition.label}
        />
      ))}
    </DropdownMenuItemsContainer>
  );
};
