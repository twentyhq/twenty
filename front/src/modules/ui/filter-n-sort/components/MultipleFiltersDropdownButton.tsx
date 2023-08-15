import { Context, useCallback, useState } from 'react';

import { DropdownMenuSeparator } from '@/ui/dropdown/components/DropdownMenuSeparator';
import { filterDefinitionUsedInDropdownScopedState } from '@/ui/filter-n-sort/states/filterDefinitionUsedInDropdownScopedState';
import { filterDropdownSearchInputScopedState } from '@/ui/filter-n-sort/states/filterDropdownSearchInputScopedState';
import { filtersScopedState } from '@/ui/filter-n-sort/states/filtersScopedState';
import { isFilterDropdownOperandSelectUnfoldedScopedState } from '@/ui/filter-n-sort/states/isFilterDropdownOperandSelectUnfoldedScopedState';
import { selectedOperandInDropdownScopedState } from '@/ui/filter-n-sort/states/selectedOperandInDropdownScopedState';
import { useSetHotkeyScope } from '@/ui/utilities/hotkey/hooks/useSetHotkeyScope';
import { useRecoilScopedState } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedState';

import { sortAndFilterBarScopedState } from '../states/sortAndFilterBarScopedState';
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

export function MultipleFiltersDropdownButton({
  context,
  HotkeyScope,
  isPrimaryButton = false,
  color,
  label,
}: {
  context: Context<string | null>;
  HotkeyScope: FiltersHotkeyScope;
  isPrimaryButton?: boolean;
  color?: string;
  label?: string;
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

  const [isSortAndFilterBarOpen, setIsSortAndFilterBarOpen] =
    useRecoilScopedState(sortAndFilterBarScopedState, context);

  function handleIsUnfoldedChange(newIsUnfolded: boolean) {
    if (newIsUnfolded && (!isFilterSelected || !isPrimaryButton)) {
      setHotkeyScope(HotkeyScope);
      setIsUnfolded(true);
      setIsSortAndFilterBarOpen(true);
    } else if (newIsUnfolded && isFilterSelected && isPrimaryButton) {
      setIsSortAndFilterBarOpen(!isSortAndFilterBarOpen);
    } else {
      if (filterDefinitionUsedInDropdown?.type === 'entity') {
        setHotkeyScope(HotkeyScope);
      }
      setIsUnfolded(false);
      resetState();
    }
  }

  return (
    <DropdownButton
      label={label ?? 'Filter'}
      isActive={isFilterSelected}
      isUnfolded={isUnfolded}
      onIsUnfoldedChange={handleIsUnfoldedChange}
      HotkeyScope={HotkeyScope}
      color={color}
    >
      {!filterDefinitionUsedInDropdown ? (
        <FilterDropdownFilterSelect context={context} />
      ) : isFilterDropdownOperandSelectUnfolded ? (
        <FilterDropdownOperandSelect context={context} />
      ) : (
        selectedOperandInDropdown && (
          <>
            <FilterDropdownOperandButton context={context} />
            <DropdownMenuSeparator />
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
            {filterDefinitionUsedInDropdown.type === 'entity' && (
              <FilterDropdownEntitySelect context={context} />
            )}
          </>
        )
      )}
    </DropdownButton>
  );
}
