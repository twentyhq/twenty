import { useCallback, useState } from 'react';
import { useRecoilState } from 'recoil';

import { filterSearchInputScopedState } from '@/filters-and-sorts/states/filterSearchInputScopedState';
import { isFilterDropdownOperandSelectUnfoldedScopedState } from '@/filters-and-sorts/states/isFilterDropdownOperandSelectUnfoldedScopedState';
import { selectedFilterInDropdownScopedState } from '@/filters-and-sorts/states/selectedFilterInDropdownScopedState';
import { selectedFiltersScopedState } from '@/filters-and-sorts/states/selectedFiltersScopedState';
import { selectedOperandInDropdownScopedState } from '@/filters-and-sorts/states/selectedOperandInDropdownScopedState';
import { captureHotkeyTypeInFocusState } from '@/hotkeys/states/captureHotkeyTypeInFocusState';
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
  const [, setCaptureHotkeyTypeInFocus] = useRecoilState(
    captureHotkeyTypeInFocusState,
  );

  const [isOperandSelectionUnfolded, setIsOperandSelectionUnfolded] =
    useRecoilScopedState(
      isFilterDropdownOperandSelectUnfoldedScopedState,
      TableContext,
    );

  const [selectedFilterInDropdown, setSelectedFilterInDropdown] =
    useRecoilScopedState(selectedFilterInDropdownScopedState, TableContext);

  const [, setFilterSearchInput] = useRecoilScopedState(
    filterSearchInputScopedState,
    TableContext,
  );

  const [selectedFilters] = useRecoilScopedState(
    selectedFiltersScopedState,
    TableContext,
  );

  const [selectedOperandInDropdown, setSelectedOperandInDropdown] =
    useRecoilScopedState(selectedOperandInDropdownScopedState, TableContext);

  const resetState = useCallback(() => {
    setIsOperandSelectionUnfolded(false);
    setSelectedFilterInDropdown(null);
    setSelectedOperandInDropdown(null);
    setFilterSearchInput('');
  }, [
    setSelectedFilterInDropdown,
    setSelectedOperandInDropdown,
    setFilterSearchInput,
    setIsOperandSelectionUnfolded,
  ]);

  const isFilterSelected = (selectedFilters?.length ?? 0) > 0;

  return (
    <DropdownButton
      label="Filter"
      isActive={isFilterSelected}
      isUnfolded={isUnfolded}
      setIsUnfolded={setIsUnfolded}
      resetState={resetState}
    >
      {!selectedFilterInDropdown ? (
        <FilterDropdownFilterSelect />
      ) : isOperandSelectionUnfolded ? (
        <FilterDropdownOperandSelect />
      ) : (
        selectedOperandInDropdown && (
          <>
            <FilterDropdownOperandButton />
            <DropdownButton.StyledSearchField autoFocus key={'search-filter'}>
              {selectedFilterInDropdown.type === 'text' && (
                <FilterDropdownTextSearchInput />
              )}
              {selectedFilterInDropdown.type === 'number' && (
                <FilterDropdownNumberSearchInput />
              )}
              {selectedFilterInDropdown.type === 'date' && (
                <FilterDropdownDateSearchInput />
              )}
              {selectedFilterInDropdown.type === 'entity' && (
                <FilterDropdownEntitySearchInput />
              )}
            </DropdownButton.StyledSearchField>
            {selectedFilterInDropdown.type === 'entity' && (
              <FilterDropdownEntitySelect />
            )}
          </>
        )
      )}
    </DropdownButton>
  );
}
