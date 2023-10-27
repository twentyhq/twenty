import { ChangeEvent } from 'react';

import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';

import { useRemoveFilter } from '../../../../views/hooks/useRemoveFilter';
import { useUpsertFilter } from '../../../../views/hooks/useUpsertFilter';
import { useFilter } from '../hooks/useFilter';

export const FilterDropdownNumberSearchInput = () => {
  const { selectedOperandInDropdown, filterDefinitionUsedInDropdown } =
    useFilter();

  const upsertFilter = useUpsertFilter();
  const removeFilter = useRemoveFilter();

  return (
    filterDefinitionUsedInDropdown &&
    selectedOperandInDropdown && (
      <DropdownMenuSearchInput
        autoFocus
        type="number"
        placeholder={filterDefinitionUsedInDropdown.label}
        onChange={(event: ChangeEvent<HTMLInputElement>) => {
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
