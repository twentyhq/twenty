import { useCallback, useState } from 'react';

import { activeTableFiltersScopedState } from '@/filters-and-sorts/states/activeTableFiltersScopedState';
import { filterDropdownSearchInputScopedState } from '@/filters-and-sorts/states/filterDropdownSearchInputScopedState';
import { isFilterDropdownOperandSelectUnfoldedScopedState } from '@/filters-and-sorts/states/isFilterDropdownOperandSelectUnfoldedScopedState';
import { selectedOperandInDropdownScopedState } from '@/filters-and-sorts/states/selectedOperandInDropdownScopedState';
import { tableFilterDefinitionUsedInDropdownScopedState } from '@/filters-and-sorts/states/tableFilterDefinitionUsedInDropdownScopedState';
import { useHotkeysScopeOnBooleanState } from '@/hotkeys/hooks/useHotkeysScopeOnBooleanState';
import { InternalHotkeysScope } from '@/hotkeys/types/internal/InternalHotkeysScope';
import { useRecoilScopedState } from '@/recoil-scope/hooks/useRecoilScopedState';
import { TableContext } from '@/ui/tables/states/TableContext';

import DropdownButton from './DropdownButton';
import { FilterDropdownDateSearchInput } from './FilterDropdownDateSearchInput';
import { FilterDropdownEntitySearchInput } from './FilterDropdownEntitySearchInput';
import { FilterDropdownEntitySelect } from './FilterDropdownEntitySelect';
import { FilterDropdownFilterSelect } from './FilterDropdownFilterSelect';
import { FilterDropdownNumberSearchInput } from './FilterDropdownNumberSearchInput';
import { FilterDropdownOperandButton } from './FilterDropdownOperandButton';
import { FilterDropdownOperandSelect } from './FilterDropdownOperandSelect';
import { FilterDropdownTextSearchInput } from './FilterDropdownTextSearchInput';

export function FilterDropdownButton() {
  const [isUnfolded, setIsUnfolded] = useState(false);

  useHotkeysScopeOnBooleanState(
    { scope: InternalHotkeysScope.TableHeaderDropdownButton },
    isUnfolded,
  );

  const [
    isFilterDropdownOperandSelectUnfolded,
    setIsFilterDropdownOperandSelectUnfolded,
  ] = useRecoilScopedState(
    isFilterDropdownOperandSelectUnfoldedScopedState,
    TableContext,
  );

  const [
    tableFilterDefinitionUsedInDropdown,
    setTableFilterDefinitionUsedInDropdown,
  ] = useRecoilScopedState(
    tableFilterDefinitionUsedInDropdownScopedState,
    TableContext,
  );

  const [, setFilterDropdownSearchInput] = useRecoilScopedState(
    filterDropdownSearchInputScopedState,
    TableContext,
  );

  const [activeTableFilters] = useRecoilScopedState(
    activeTableFiltersScopedState,
    TableContext,
  );

  const [selectedOperandInDropdown, setSelectedOperandInDropdown] =
    useRecoilScopedState(selectedOperandInDropdownScopedState, TableContext);

  const resetState = useCallback(() => {
    setIsFilterDropdownOperandSelectUnfolded(false);
    setTableFilterDefinitionUsedInDropdown(null);
    setSelectedOperandInDropdown(null);
    setFilterDropdownSearchInput('');
  }, [
    setTableFilterDefinitionUsedInDropdown,
    setSelectedOperandInDropdown,
    setFilterDropdownSearchInput,
    setIsFilterDropdownOperandSelectUnfolded,
  ]);

  const isFilterSelected = (activeTableFilters?.length ?? 0) > 0;

  function handleIsUnfoldedChange(newIsUnfolded: boolean) {
    if (newIsUnfolded) {
      setIsUnfolded(true);
    } else {
      setIsUnfolded(false);
      resetState();
    }
  }

  return (
    <DropdownButton
      label="Filter"
      isActive={isFilterSelected}
      isUnfolded={isUnfolded}
      onIsUnfoldedChange={handleIsUnfoldedChange}
    >
      {!tableFilterDefinitionUsedInDropdown ? (
        <FilterDropdownFilterSelect />
      ) : isFilterDropdownOperandSelectUnfolded ? (
        <FilterDropdownOperandSelect />
      ) : (
        selectedOperandInDropdown && (
          <>
            <FilterDropdownOperandButton />
            <DropdownButton.StyledSearchField autoFocus key={'search-filter'}>
              {tableFilterDefinitionUsedInDropdown.type === 'text' && (
                <FilterDropdownTextSearchInput />
              )}
              {tableFilterDefinitionUsedInDropdown.type === 'number' && (
                <FilterDropdownNumberSearchInput />
              )}
              {tableFilterDefinitionUsedInDropdown.type === 'date' && (
                <FilterDropdownDateSearchInput />
              )}
              {tableFilterDefinitionUsedInDropdown.type === 'entity' && (
                <FilterDropdownEntitySearchInput />
              )}
            </DropdownButton.StyledSearchField>
            {tableFilterDefinitionUsedInDropdown.type === 'entity' && (
              <FilterDropdownEntitySelect />
            )}
          </>
        )
      )}
    </DropdownButton>
  );
}
