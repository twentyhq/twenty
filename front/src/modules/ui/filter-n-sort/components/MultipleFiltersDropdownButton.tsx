import { Context, useCallback, useState } from 'react';

import { StyledDropdownMenuSeparator } from '@/ui/dropdown/components/StyledDropdownMenuSeparator';
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
  hotKeyScope,
  isPrimaryButton = false,
  color,
  icon,
  label,
}: {
  context: Context<string | null>;
  hotKeyScope: FiltersHotkeyScope;
  isPrimaryButton?: boolean;
  icon?: React.ReactNode;
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

  const [sortAndFilterBar, setSortAndFilterBar] = useRecoilScopedState(
    sortAndFilterBarScopedState,
    context,
  );

  function handleIsUnfoldedChange(unfolded: boolean) {
    if (unfolded && isPrimaryButton) {
      setSortAndFilterBar(!sortAndFilterBar);
    }

    if (
      unfolded &&
      ((isPrimaryButton && !isFilterSelected) || !isPrimaryButton)
    ) {
      setHotkeyScope(hotKeyScope);
      setIsUnfolded(true);
      return;
    }

    if (filterDefinitionUsedInDropdown?.type === 'entity') {
      setHotkeyScope(hotKeyScope);
    }

    setIsUnfolded(false);
    resetState();
  }

  return (
    <DropdownButton
      label={label ?? 'Filter'}
      isActive={isFilterSelected}
      isUnfolded={isUnfolded}
      icon={icon}
      onIsUnfoldedChange={handleIsUnfoldedChange}
      hotKeyScope={hotKeyScope}
      color={color}
      menuWidth={
        selectedOperandInDropdown &&
        filterDefinitionUsedInDropdown?.type === 'date'
          ? 'auto'
          : undefined
      }
    >
      {!filterDefinitionUsedInDropdown ? (
        <FilterDropdownFilterSelect context={context} />
      ) : isFilterDropdownOperandSelectUnfolded ? (
        <FilterDropdownOperandSelect context={context} />
      ) : (
        selectedOperandInDropdown && (
          <>
            <FilterDropdownOperandButton context={context} />
            <StyledDropdownMenuSeparator />
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
