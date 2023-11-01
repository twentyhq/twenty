import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';

import { useFilter } from '../hooks/useFilter';

import { MultipleFiltersDropdownFilterOnFilterChangedEffect } from './MultipleFiltersDropdownFilterOnFilterChangedEffect';
import { ObjectFilterDropdownDateSearchInput } from './ObjectFilterDropdownDateSearchInput';
import { ObjectFilterDropdownEntitySearchInput } from './ObjectFilterDropdownEntitySearchInput';
import { ObjectFilterDropdownEntitySelect } from './ObjectFilterDropdownEntitySelect';
import { ObjectFilterDropdownFilterSelect } from './ObjectFilterDropdownFilterSelect';
import { ObjectFilterDropdownNumberSearchInput } from './ObjectFilterDropdownNumberSearchInput';
import { ObjectFilterDropdownOperandButton } from './ObjectFilterDropdownOperandButton';
import { ObjectFilterDropdownOperandSelect } from './ObjectFilterDropdownOperandSelect';
import { ObjectFilterDropdownTextSearchInput } from './ObjectFilterDropdownTextSearchInput';

export const MultipleFiltersDropdownContent = () => {
  const {
    isObjectFilterDropdownOperandSelectUnfolded,
    filterDefinitionUsedInDropdown,
    selectedOperandInDropdown,
  } = useFilter();

  return (
    <>
      {!filterDefinitionUsedInDropdown ? (
        <ObjectFilterDropdownFilterSelect />
      ) : isObjectFilterDropdownOperandSelectUnfolded ? (
        <ObjectFilterDropdownOperandSelect />
      ) : (
        selectedOperandInDropdown && (
          <>
            <ObjectFilterDropdownOperandButton />
            <DropdownMenuSeparator />
            {filterDefinitionUsedInDropdown.type === 'text' && (
              <ObjectFilterDropdownTextSearchInput />
            )}
            {filterDefinitionUsedInDropdown.type === 'number' && (
              <ObjectFilterDropdownNumberSearchInput />
            )}
            {filterDefinitionUsedInDropdown.type === 'date' && (
              <ObjectFilterDropdownDateSearchInput />
            )}
            {filterDefinitionUsedInDropdown.type === 'entity' && (
              <ObjectFilterDropdownEntitySearchInput />
            )}
            {filterDefinitionUsedInDropdown.type === 'entity' && (
              <ObjectFilterDropdownEntitySelect />
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
