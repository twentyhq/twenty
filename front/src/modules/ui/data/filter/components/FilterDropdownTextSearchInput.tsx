import { ChangeEvent } from 'react';

import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';
import { useRecoilScopedState } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedState';

import { useFilterCurrentlyEdited } from '../../view-bar/hooks/useFilterCurrentlyEdited';
import { useRemoveFilter } from '../../view-bar/hooks/useRemoveFilter';
import { useUpsertFilter } from '../../view-bar/hooks/useUpsertFilter';
import { useViewBarContext } from '../../view-bar/hooks/useViewBarContext';
import { filterDefinitionUsedInDropdownScopedState } from '../../view-bar/states/filterDefinitionUsedInDropdownScopedState';
import { filterDropdownSearchInputScopedState } from '../../view-bar/states/filterDropdownSearchInputScopedState';
import { selectedOperandInDropdownScopedState } from '../../view-bar/states/selectedOperandInDropdownScopedState';

export const FilterDropdownTextSearchInput = () => {
  const { ViewBarRecoilScopeContext } = useViewBarContext();

  const [filterDefinitionUsedInDropdown] = useRecoilScopedState(
    filterDefinitionUsedInDropdownScopedState,
    ViewBarRecoilScopeContext,
  );

  const [selectedOperandInDropdown] = useRecoilScopedState(
    selectedOperandInDropdownScopedState,
    ViewBarRecoilScopeContext,
  );

  const [filterDropdownSearchInput, setFilterDropdownSearchInput] =
    useRecoilScopedState(
      filterDropdownSearchInputScopedState,
      ViewBarRecoilScopeContext,
    );

  const upsertFilter = useUpsertFilter();
  const removeFilter = useRemoveFilter();

  const filterCurrentlyEdited = useFilterCurrentlyEdited();

  return (
    filterDefinitionUsedInDropdown &&
    selectedOperandInDropdown && (
      <DropdownMenuSearchInput
        autoFocus
        type="text"
        placeholder={filterDefinitionUsedInDropdown.label}
        value={filterCurrentlyEdited?.value ?? filterDropdownSearchInput}
        onChange={(event: ChangeEvent<HTMLInputElement>) => {
          setFilterDropdownSearchInput(event.target.value);

          if (event.target.value === '') {
            removeFilter(filterDefinitionUsedInDropdown.key);
          } else {
            upsertFilter({
              key: filterDefinitionUsedInDropdown.key,
              type: filterDefinitionUsedInDropdown.type,
              value: event.target.value,
              operand: selectedOperandInDropdown,
              displayValue: event.target.value,
            });
          }
        }}
      />
    )
  );
};
