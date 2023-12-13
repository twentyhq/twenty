import { ObjectFilterDropdownRecordSearchInput } from '@/object-record/object-filter-dropdown/components/ObjectFilterDropdownEntitySearchInput';
import { useFilterDropdown } from '@/object-record/object-filter-dropdown/hooks/useFilterDropdown';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';

import { MultipleFiltersDropdownFilterOnFilterChangedEffect } from './MultipleFiltersDropdownFilterOnFilterChangedEffect';
import { ObjectFilterDropdownDateSearchInput } from './ObjectFilterDropdownDateSearchInput';
import { ObjectFilterDropdownFilterSelect } from './ObjectFilterDropdownFilterSelect';
import { ObjectFilterDropdownNumberSearchInput } from './ObjectFilterDropdownNumberSearchInput';
import { ObjectFilterDropdownOperandButton } from './ObjectFilterDropdownOperandButton';
import { ObjectFilterDropdownOperandSelect } from './ObjectFilterDropdownOperandSelect';
import { ObjectFilterDropdownRecordSelect } from './ObjectFilterDropdownRecordSelect';
import { ObjectFilterDropdownTextSearchInput } from './ObjectFilterDropdownTextSearchInput';

type MultipleFiltersDropdownContentProps = {
  filterDropdownId?: string;
};

export const MultipleFiltersDropdownContent = ({
  filterDropdownId,
}: MultipleFiltersDropdownContentProps) => {
  const {
    isObjectFilterDropdownOperandSelectUnfolded,
    filterDefinitionUsedInDropdown,
    selectedOperandInDropdown,
  } = useFilterDropdown({ filterDropdownId });

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
            {['TEXT', 'EMAIL', 'PHONE', 'FULL_NAME', 'LINK'].includes(
              filterDefinitionUsedInDropdown.type,
            ) && <ObjectFilterDropdownTextSearchInput />}
            {['NUMBER', 'CURRENCY'].includes(
              filterDefinitionUsedInDropdown.type,
            ) && <ObjectFilterDropdownNumberSearchInput />}
            {filterDefinitionUsedInDropdown.type === 'DATE_TIME' && (
              <ObjectFilterDropdownDateSearchInput />
            )}
            {filterDefinitionUsedInDropdown.type === 'RELATION' && (
              <>
                <ObjectFilterDropdownRecordSearchInput />
                <DropdownMenuSeparator />
                <ObjectFilterDropdownRecordSelect />
              </>
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
