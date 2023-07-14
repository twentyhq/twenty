import { Context } from 'react';

import { availableFiltersScopedState } from '@/lib/filters-and-sorts/states/availableFiltersScopedState';
import { filterDefinitionUsedInDropdownScopedState } from '@/lib/filters-and-sorts/states/filterDefinitionUsedInDropdownScopedState';
import { filterDropdownSearchInputScopedState } from '@/lib/filters-and-sorts/states/filterDropdownSearchInputScopedState';
import { selectedOperandInDropdownScopedState } from '@/lib/filters-and-sorts/states/selectedOperandInDropdownScopedState';
import { getOperandsForFilterType } from '@/lib/filters-and-sorts/utils/getOperandsForFilterType';
import { useSetHotkeyScope } from '@/lib/hotkeys/hooks/useSetHotkeyScope';
import { useRecoilScopedState } from '@/recoil-scope/hooks/useRecoilScopedState';
import { useRecoilScopedValue } from '@/recoil-scope/hooks/useRecoilScopedValue';
import { RelationPickerHotkeyScope } from '@/relation-picker/types/RelationPickerHotkeyScope';
import { DropdownMenuItemContainer } from '@/ui/components/menu/DropdownMenuItemContainer';
import { DropdownMenuSelectableItem } from '@/ui/components/menu/DropdownMenuSelectableItem';

import DropdownButton from './DropdownButton';

export function FilterDropdownFilterSelect({
  context,
}: {
  context: Context<string | null>;
}) {
  const [, setFilterDefinitionUsedInDropdown] = useRecoilScopedState(
    filterDefinitionUsedInDropdownScopedState,
    context,
  );

  const [, setSelectedOperandInDropdown] = useRecoilScopedState(
    selectedOperandInDropdownScopedState,
    context,
  );

  const [, setFilterDropdownSearchInput] = useRecoilScopedState(
    filterDropdownSearchInputScopedState,
    context,
  );

  const availableFilters = useRecoilScopedValue(
    availableFiltersScopedState,
    context,
  );

  const setHotkeyScope = useSetHotkeyScope();

  return (
    <DropdownMenuItemContainer style={{ maxHeight: '300px' }}>
      {availableFilters.map((availableFilter, index) => (
        <DropdownMenuSelectableItem
          key={`select-filter-${index}`}
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
        >
          <DropdownButton.StyledIcon>
            {availableFilter.icon}
          </DropdownButton.StyledIcon>
          {availableFilter.label}
        </DropdownMenuSelectableItem>
      ))}
    </DropdownMenuItemContainer>
  );
}
