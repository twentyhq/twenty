import { availableFiltersScopedState } from '@/filters-and-sorts/states/availableFiltersScopedState';
import { filterSearchInputScopedState } from '@/filters-and-sorts/states/filterSearchInputScopedState';
import { selectedFilterInDropdownScopedState } from '@/filters-and-sorts/states/selectedFilterInDropdownScopedState';
import { selectedOperandInDropdownScopedState } from '@/filters-and-sorts/states/selectedOperandInDropdownScopedState';
import { getOperandsForFilterType } from '@/filters-and-sorts/utils/getOperandsForFilterType';
import { useRecoilScopedState } from '@/recoil-scope/hooks/useRecoilScopedState';
import { useRecoilScopedValue } from '@/recoil-scope/hooks/useRecoilScopedValue';
import { TableContext } from '@/ui/tables/states/TableContext';

import { DropdownMenuItemContainer } from '../../menu/DropdownMenuItemContainer';
import { DropdownMenuSelectableItem } from '../../menu/DropdownMenuSelectableItem';

import DropdownButton from './DropdownButton';

export function FilterDropdownFilterSelect() {
  const [, setSelectedFilterInDropdown] = useRecoilScopedState(
    selectedFilterInDropdownScopedState,
    TableContext,
  );

  const [, setSelectedOperandInDropdown] = useRecoilScopedState(
    selectedOperandInDropdownScopedState,
    TableContext,
  );

  const [, setFilterSearchInput] = useRecoilScopedState(
    filterSearchInputScopedState,
    TableContext,
  );

  const availableFilters = useRecoilScopedValue(
    availableFiltersScopedState,
    TableContext,
  );

  return (
    <DropdownMenuItemContainer>
      {availableFilters.map((filter, index) => (
        <DropdownMenuSelectableItem
          key={`select-filter-${index}`}
          onClick={() => {
            setSelectedFilterInDropdown(filter);
            setSelectedOperandInDropdown(
              getOperandsForFilterType(filter.type)?.[0],
            );

            setFilterSearchInput('');
          }}
        >
          <DropdownButton.StyledIcon>{filter.icon}</DropdownButton.StyledIcon>
          {filter.label}
        </DropdownMenuSelectableItem>
      ))}
    </DropdownMenuItemContainer>
  );
}
