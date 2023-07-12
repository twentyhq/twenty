import { Context } from 'react';

import { useSetHotkeysScope } from '@/hotkeys/hooks/useSetHotkeysScope';
import { InternalHotkeysScope } from '@/hotkeys/types/internal/InternalHotkeysScope';
import { availableFiltersScopedState } from '@/lib/filters-and-sorts/states/availableFiltersScopedState';
import { filterDefinitionUsedInDropdownScopedState } from '@/lib/filters-and-sorts/states/filterDefinitionUsedInDropdownScopedState';
import { filterDropdownSearchInputScopedState } from '@/lib/filters-and-sorts/states/filterDropdownSearchInputScopedState';
import { selectedOperandInDropdownScopedState } from '@/lib/filters-and-sorts/states/selectedOperandInDropdownScopedState';
import { getOperandsForFilterType } from '@/lib/filters-and-sorts/utils/getOperandsForFilterType';
import { useRecoilScopedState } from '@/recoil-scope/hooks/useRecoilScopedState';
import { useRecoilScopedValue } from '@/recoil-scope/hooks/useRecoilScopedValue';
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

  const setHotkeysScope = useSetHotkeysScope();

  return (
    <DropdownMenuItemContainer style={{ maxHeight: '300px' }}>
      {availableFilters.map((availableFilter, index) => (
        <DropdownMenuSelectableItem
          key={`select-filter-${index}`}
          onClick={() => {
            setFilterDefinitionUsedInDropdown(availableFilter);

            if (availableFilter.type === 'entity') {
              setHotkeysScope(InternalHotkeysScope.RelationPicker);
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
