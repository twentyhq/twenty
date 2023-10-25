import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';

import { useFilter } from '../hooks/useFilter';

import { FilterDropdownDateSearchInput } from './FilterDropdownDateSearchInput';
import { FilterDropdownEntitySearchInput } from './FilterDropdownEntitySearchInput';
import { FilterDropdownEntitySelect } from './FilterDropdownEntitySelect';
import { FilterDropdownFilterSelect } from './FilterDropdownFilterSelect';
import { FilterDropdownNumberSearchInput } from './FilterDropdownNumberSearchInput';
import { FilterDropdownOperandButton } from './FilterDropdownOperandButton';
import { FilterDropdownOperandSelect } from './FilterDropdownOperandSelect';
import { FilterDropdownTextSearchInput } from './FilterDropdownTextSearchInput';
import { MultipleFiltersDropdownFilterOnFilterChangedEffect } from './MultipleFiltersDropdownFilterOnFilterChangedEffect';

export const MultipleFiltersDropdownContent = () => {
  const {
    isFilterDropdownOperandSelectUnfolded,
    filterDefinitionUsedInDropdown,
    selectedOperandInDropdown,
  } = useFilter();

  return (
    <>
      {!filterDefinitionUsedInDropdown ? (
        <FilterDropdownFilterSelect />
      ) : isFilterDropdownOperandSelectUnfolded ? (
        <FilterDropdownOperandSelect />
      ) : (
        selectedOperandInDropdown && (
          <>
            <FilterDropdownOperandButton />
            <DropdownMenuSeparator />
            {filterDefinitionUsedInDropdown.type === 'text' && (
              <FilterDropdownTextSearchInput />
            )}
            {filterDefinitionUsedInDropdown.type === 'number' && (
              <FilterDropdownNumberSearchInput />
            )}
            {filterDefinitionUsedInDropdown.type === 'date' && (
              <FilterDropdownDateSearchInput />
            )}
            {filterDefinitionUsedInDropdown.type === 'entity' && (
              <FilterDropdownEntitySearchInput />
            )}
            {filterDefinitionUsedInDropdown.type === 'entity' && (
              <FilterDropdownEntitySelect />
            )}
          </>
        )
      )}
      <MultipleFiltersDropdownFilterOnFilterChangedEffect
        filterDefinitionUsedInDropdownType={
          filterDefinitionUsedInDropdown?.type
        }
      />
    </>
  );
};
