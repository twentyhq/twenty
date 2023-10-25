import { ChangeEvent } from 'react';

import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';

import { useRemoveFilter } from '../../../../views/hooks/useRemoveFilter';
import { useUpsertFilter } from '../../../../views/hooks/useUpsertFilter';
import { useFilter } from '../hooks/useFilter';
import { useFilterCurrentlyEdited } from '../hooks/useFilterCurrentlyEdited';

export const FilterDropdownTextSearchInput = () => {
  const {
    filterDefinitionUsedInDropdown,
    selectedOperandInDropdown,
    filterDropdownSearchInput,
    setFilterDropdownSearchInput,
  } = useFilter();

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
