import { useLazyLoadIcons } from '@/ui/input/hooks/useLazyLoadIcons';
import { RelationPickerHotkeyScope } from '@/ui/input/relation-picker/types/RelationPickerHotkeyScope';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { MenuItem } from '@/ui/navigation/menu-item/components/MenuItem';
import { useFilterDropdown } from '@/ui/object/object-filter-dropdown/hooks/useFilterDropdown';
import { useSetHotkeyScope } from '@/ui/utilities/hotkey/hooks/useSetHotkeyScope';

import { getOperandsForFilterType } from '../utils/getOperandsForFilterType';

export const ObjectFilterDropdownFilterSelect = () => {
  const {
    setFilterDefinitionUsedInDropdown,
    setSelectedOperandInDropdown,
    setObjectFilterDropdownSearchInput,
    availableFilterDefinitions,
  } = useFilterDropdown();

  const { icons } = useLazyLoadIcons();

  const setHotkeyScope = useSetHotkeyScope();

  return (
    <DropdownMenuItemsContainer>
      {[...availableFilterDefinitions]
        .sort((a, b) => a.label.localeCompare(b.label))
        .map((availableFilterDefinition, index) => (
          <MenuItem
            key={`select-filter-${index}`}
            testId={`select-filter-${index}`}
            onClick={() => {
              setFilterDefinitionUsedInDropdown(availableFilterDefinition);

              if (availableFilterDefinition.type === 'RELATION') {
                setHotkeyScope(RelationPickerHotkeyScope.RelationPicker);
              }

              setSelectedOperandInDropdown(
                getOperandsForFilterType(availableFilterDefinition.type)?.[0],
              );

              setObjectFilterDropdownSearchInput('');
            }}
            LeftIcon={icons[availableFilterDefinition.iconName]}
            text={availableFilterDefinition.label}
          />
        ))}
    </DropdownMenuItemsContainer>
  );
};
