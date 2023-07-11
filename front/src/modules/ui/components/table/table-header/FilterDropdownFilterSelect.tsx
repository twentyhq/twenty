import { availableTableFiltersScopedState } from '@/filters-and-sorts/states/availableTableFiltersScopedState';
import { filterDropdownSearchInputScopedState } from '@/filters-and-sorts/states/filterDropdownSearchInputScopedState';
import { selectedOperandInDropdownScopedState } from '@/filters-and-sorts/states/selectedOperandInDropdownScopedState';
import { tableFilterDefinitionUsedInDropdownScopedState } from '@/filters-and-sorts/states/tableFilterDefinitionUsedInDropdownScopedState';
import { getOperandsForFilterType } from '@/filters-and-sorts/utils/getOperandsForFilterType';
import { useSetHotkeysScope } from '@/hotkeys/hooks/useSetHotkeysScope';
import { InternalHotkeysScope } from '@/hotkeys/types/internal/InternalHotkeysScope';
import { useRecoilScopedState } from '@/recoil-scope/hooks/useRecoilScopedState';
import { useRecoilScopedValue } from '@/recoil-scope/hooks/useRecoilScopedValue';
import { TableContext } from '@/ui/tables/states/TableContext';

import { DropdownMenuItemContainer } from '../../menu/DropdownMenuItemContainer';
import { DropdownMenuSelectableItem } from '../../menu/DropdownMenuSelectableItem';

import DropdownButton from './DropdownButton';

export function FilterDropdownFilterSelect() {
  const [, setTableFilterDefinitionUsedInDropdown] = useRecoilScopedState(
    tableFilterDefinitionUsedInDropdownScopedState,
    TableContext,
  );

  const [, setSelectedOperandInDropdown] = useRecoilScopedState(
    selectedOperandInDropdownScopedState,
    TableContext,
  );

  const [, setFilterDropdownSearchInput] = useRecoilScopedState(
    filterDropdownSearchInputScopedState,
    TableContext,
  );

  const availableTableFilters = useRecoilScopedValue(
    availableTableFiltersScopedState,
    TableContext,
  );

  const setHotkeysScope = useSetHotkeysScope();

  return (
    <DropdownMenuItemContainer style={{ maxHeight: '300px' }}>
      {availableTableFilters.map((availableTableFilter, index) => (
        <DropdownMenuSelectableItem
          key={`select-filter-${index}`}
          onClick={() => {
            setTableFilterDefinitionUsedInDropdown(availableTableFilter);

            if (availableTableFilter.type === 'entity') {
              setHotkeysScope(InternalHotkeysScope.RelationPicker);
            }

            setSelectedOperandInDropdown(
              getOperandsForFilterType(availableTableFilter.type)?.[0],
            );

            setFilterDropdownSearchInput('');
          }}
        >
          <DropdownButton.StyledIcon>
            {availableTableFilter.icon}
          </DropdownButton.StyledIcon>
          {availableTableFilter.label}
        </DropdownMenuSelectableItem>
      ))}
    </DropdownMenuItemContainer>
  );
}
