import { useRecoilValue } from 'recoil';

import { ObjectFilterDropdownSearchInput } from '@/object-record/object-filter-dropdown/components/ObjectFilterDropdownSearchInput';
import { useFilterDropdown } from '@/object-record/object-filter-dropdown/hooks/useFilterDropdown';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { ViewFilterOperand } from '@/views/types/ViewFilterOperand';

import { MultipleFiltersDropdownFilterOnFilterChangedEffect } from './MultipleFiltersDropdownFilterOnFilterChangedEffect';
import { ObjectFilterDropdownDateInput } from './ObjectFilterDropdownDateInput';
import { ObjectFilterDropdownFilterSelect } from './ObjectFilterDropdownFilterSelect';
import { ObjectFilterDropdownNumberInput } from './ObjectFilterDropdownNumberInput';
import { ObjectFilterDropdownOperandButton } from './ObjectFilterDropdownOperandButton';
import { ObjectFilterDropdownOperandSelect } from './ObjectFilterDropdownOperandSelect';
import { ObjectFilterDropdownOptionSelect } from './ObjectFilterDropdownOptionSelect';
import { ObjectFilterDropdownRecordSelect } from './ObjectFilterDropdownRecordSelect';
import { ObjectFilterDropdownTextSearchInput } from './ObjectFilterDropdownTextSearchInput';

type MultipleFiltersDropdownContentProps = {
  filterDropdownId?: string;
};

export const MultipleFiltersDropdownContent = ({
  filterDropdownId,
}: MultipleFiltersDropdownContentProps) => {
  const {
    isObjectFilterDropdownOperandSelectUnfoldedState,
    filterDefinitionUsedInDropdownState,
    selectedOperandInDropdownState,
  } = useFilterDropdown({ filterDropdownId });

  const isObjectFilterDropdownOperandSelectUnfolded = useRecoilValue(
    isObjectFilterDropdownOperandSelectUnfoldedState,
  );
  const filterDefinitionUsedInDropdown = useRecoilValue(
    filterDefinitionUsedInDropdownState,
  );
  const selectedOperandInDropdown = useRecoilValue(
    selectedOperandInDropdownState,
  );
  const isEmptyOperand =
    selectedOperandInDropdown &&
    [ViewFilterOperand.IsEmpty, ViewFilterOperand.IsNotEmpty].includes(
      selectedOperandInDropdown,
    );

  return (
    <>
      {!filterDefinitionUsedInDropdown ? (
        <ObjectFilterDropdownFilterSelect />
      ) : isObjectFilterDropdownOperandSelectUnfolded ? (
        <ObjectFilterDropdownOperandSelect />
      ) : isEmptyOperand ? (
        <ObjectFilterDropdownOperandButton />
      ) : (
        selectedOperandInDropdown && (
          <>
            <ObjectFilterDropdownOperandButton />
            <DropdownMenuSeparator />
            {[
              'TEXT',
              'EMAIL',
              'PHONE',
              'FULL_NAME',
              'LINK',
              'LINKS',
              'ADDRESS',
            ].includes(filterDefinitionUsedInDropdown.type) && (
              <ObjectFilterDropdownTextSearchInput />
            )}
            {['NUMBER', 'CURRENCY'].includes(
              filterDefinitionUsedInDropdown.type,
            ) && <ObjectFilterDropdownNumberInput />}
            {filterDefinitionUsedInDropdown.type === 'DATE_TIME' && (
              <ObjectFilterDropdownDateInput />
            )}
            {filterDefinitionUsedInDropdown.type === 'RELATION' && (
              <>
                <ObjectFilterDropdownSearchInput />
                <DropdownMenuSeparator />
                <ObjectFilterDropdownRecordSelect />
              </>
            )}
            {filterDefinitionUsedInDropdown.type === 'SELECT' && (
              <>
                <ObjectFilterDropdownSearchInput />
                <DropdownMenuSeparator />
                <ObjectFilterDropdownOptionSelect />
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
