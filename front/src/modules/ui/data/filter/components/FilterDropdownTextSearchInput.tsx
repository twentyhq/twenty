import { ChangeEvent } from 'react';

import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';

import { useRemoveFilter } from '../../../../views/hooks/useRemoveFilter';
import { useUpsertFilter } from '../../../../views/hooks/useUpsertFilter';
import { useFilter } from '../hooks/useFilter';

export const FilterDropdownTextSearchInput = () => {
  const {
    filterDefinitionUsedInDropdown,
    selectedOperandInDropdown,
    filterDropdownSearchInput,
    setFilterDropdownSearchInput,
    selectedFilter,
  } = useFilter();

  const upsertFilter = useUpsertFilter();
  const removeFilter = useRemoveFilter();

  return (
    filterDefinitionUsedInDropdown &&
    selectedOperandInDropdown && (
      <DropdownMenuSearchInput
        autoFocus
        type="text"
        placeholder={filterDefinitionUsedInDropdown.label}
        value={selectedFilter?.value ?? filterDropdownSearchInput}
        onChange={(event: ChangeEvent<HTMLInputElement>) => {
          setFilterDropdownSearchInput(event.target.value);

          if (event.target.value === '') {
            removeFilter(filterDefinitionUsedInDropdown.fieldId);
          } else {
            upsertFilter({
              fieldId: filterDefinitionUsedInDropdown.fieldId,
              value: event.target.value,
              operand: selectedOperandInDropdown,
              displayValue: event.target.value,
              definition: filterDefinitionUsedInDropdown,
            });
          }
        }}
      />
    )
  );
};
