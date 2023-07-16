import { Context, useCallback, useState } from 'react';
import { Key } from 'ts-key-enum';

import { filterDefinitionUsedInDropdownScopedState } from '@/ui/filter-n-sort/states/filterDefinitionUsedInDropdownScopedState';
import { filterDropdownSearchInputScopedState } from '@/ui/filter-n-sort/states/filterDropdownSearchInputScopedState';
import { filtersScopedState } from '@/ui/filter-n-sort/states/filtersScopedState';
import { isFilterDropdownOperandSelectUnfoldedScopedState } from '@/ui/filter-n-sort/states/isFilterDropdownOperandSelectUnfoldedScopedState';
import { selectedOperandInDropdownScopedState } from '@/ui/filter-n-sort/states/selectedOperandInDropdownScopedState';
import { useScopedHotkeys } from '@/ui/hotkey/hooks/useScopedHotkeys';
import { useSetHotkeyScope } from '@/ui/hotkey/hooks/useSetHotkeyScope';
import { useRecoilScopedState } from '@/ui/recoil-scope/hooks/useRecoilScopedState';
import { RelationPickerHotkeyScope } from '@/ui/relation-picker/types/RelationPickerHotkeyScope';

import { FiltersHotkeyScope } from '../types/FiltersHotkeyScope';

import DropdownButton from './DropdownButton';
import { FilterDropdownDateSearchInput } from './FilterDropdownDateSearchInput';
import { FilterDropdownEntitySearchInput } from './FilterDropdownEntitySearchInput';
import { FilterDropdownEntitySelect } from './FilterDropdownEntitySelect';
import { FilterDropdownFilterSelect } from './FilterDropdownFilterSelect';
import { FilterDropdownNumberSearchInput } from './FilterDropdownNumberSearchInput';
import { FilterDropdownOperandButton } from './FilterDropdownOperandButton';
import { FilterDropdownOperandSelect } from './FilterDropdownOperandSelect';
import { FilterDropdownTextSearchInput } from './FilterDropdownTextSearchInput';

export function FilterDropdownButton({
  context,
  HotkeyScope,
}: {
  context: Context<string | null>;
  HotkeyScope: FiltersHotkeyScope;
}) {
  const [isUnfolded, setIsUnfolded] = useState(false);

  const [
    isFilterDropdownOperandSelectUnfolded,
    setIsFilterDropdownOperandSelectUnfolded,
  ] = useRecoilScopedState(
    isFilterDropdownOperandSelectUnfoldedScopedState,
    context,
  );

  const [filterDefinitionUsedInDropdown, setFilterDefinitionUsedInDropdown] =
    useRecoilScopedState(filterDefinitionUsedInDropdownScopedState, context);

  const [, setFilterDropdownSearchInput] = useRecoilScopedState(
    filterDropdownSearchInputScopedState,
    context,
  );

  const [filters] = useRecoilScopedState(filtersScopedState, context);

  const [selectedOperandInDropdown, setSelectedOperandInDropdown] =
    useRecoilScopedState(selectedOperandInDropdownScopedState, context);

  const resetState = useCallback(() => {
    setIsFilterDropdownOperandSelectUnfolded(false);
    setFilterDefinitionUsedInDropdown(null);
    setSelectedOperandInDropdown(null);
    setFilterDropdownSearchInput('');
  }, [
    setFilterDefinitionUsedInDropdown,
    setSelectedOperandInDropdown,
    setFilterDropdownSearchInput,
    setIsFilterDropdownOperandSelectUnfolded,
  ]);

  const isFilterSelected = (filters?.length ?? 0) > 0;

  const setHotkeyScope = useSetHotkeyScope();

  function handleIsUnfoldedChange(newIsUnfolded: boolean) {
    if (newIsUnfolded) {
      setHotkeyScope(HotkeyScope);
      setIsUnfolded(true);
    } else {
      if (filterDefinitionUsedInDropdown?.type === 'entity') {
        setHotkeyScope(HotkeyScope);
      }
      setIsUnfolded(false);
      resetState();
    }
  }

  useScopedHotkeys(
    [Key.Escape],
    () => {
      handleIsUnfoldedChange(false);
    },
    RelationPickerHotkeyScope.RelationPicker,
    [handleIsUnfoldedChange],
  );

  return (
    <DropdownButton
      label="Filter"
      isActive={isFilterSelected}
      isUnfolded={isUnfolded}
      onIsUnfoldedChange={handleIsUnfoldedChange}
      HotkeyScope={HotkeyScope}
    >
      {!filterDefinitionUsedInDropdown ? (
        <FilterDropdownFilterSelect context={context} />
      ) : isFilterDropdownOperandSelectUnfolded ? (
        <FilterDropdownOperandSelect context={context} />
      ) : (
        selectedOperandInDropdown && (
          <>
            <FilterDropdownOperandButton context={context} />
            <DropdownButton.StyledSearchField autoFocus key={'search-filter'}>
              {filterDefinitionUsedInDropdown.type === 'text' && (
                <FilterDropdownTextSearchInput context={context} />
              )}
              {filterDefinitionUsedInDropdown.type === 'number' && (
                <FilterDropdownNumberSearchInput context={context} />
              )}
              {filterDefinitionUsedInDropdown.type === 'date' && (
                <FilterDropdownDateSearchInput context={context} />
              )}
              {filterDefinitionUsedInDropdown.type === 'entity' && (
                <FilterDropdownEntitySearchInput context={context} />
              )}
            </DropdownButton.StyledSearchField>
            {filterDefinitionUsedInDropdown.type === 'entity' && (
              <FilterDropdownEntitySelect context={context} />
            )}
          </>
        )
      )}
    </DropdownButton>
  );
}
