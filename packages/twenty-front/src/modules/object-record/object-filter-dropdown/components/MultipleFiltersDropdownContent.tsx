import { useRecoilValue } from 'recoil';

import { ObjectFilterDropdownSearchInput } from '@/object-record/object-filter-dropdown/components/ObjectFilterDropdownSearchInput';
import { useFilterDropdown } from '@/object-record/object-filter-dropdown/hooks/useFilterDropdown';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { ViewFilterOperand } from '@/views/types/ViewFilterOperand';

import { ObjectFilterDropdownRatingInput } from '@/object-record/object-filter-dropdown/components/ObjectFilterDropdownRatingInput';
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
  const isConfigurable =
    selectedOperandInDropdown &&
    [
      ViewFilterOperand.Is,
      ViewFilterOperand.IsNotNull,
      ViewFilterOperand.IsNot,
      ViewFilterOperand.LessThan,
      ViewFilterOperand.GreaterThan,
      ViewFilterOperand.IsBefore,
      ViewFilterOperand.IsAfter,
      ViewFilterOperand.Contains,
      ViewFilterOperand.DoesNotContain,
      ViewFilterOperand.IsRelative,
    ].includes(selectedOperandInDropdown);

  return (
    <>
      {!filterDefinitionUsedInDropdown ? (
        <ObjectFilterDropdownFilterSelect />
      ) : isObjectFilterDropdownOperandSelectUnfolded ? (
        <ObjectFilterDropdownOperandSelect />
      ) : isConfigurable ? (
        selectedOperandInDropdown && (
          <>
            <ObjectFilterDropdownOperandButton />
            <DropdownMenuSeparator />
            {[
              'TEXT',
              'EMAIL',
              'EMAILS',
              'PHONE',
              'FULL_NAME',
              'LINK',
              'LINKS',
              'ADDRESS',
              'ACTOR',
              'ARRAY',
              'PHONES',
            ].includes(filterDefinitionUsedInDropdown.type) && (
              <ObjectFilterDropdownTextSearchInput />
            )}
            {['NUMBER', 'CURRENCY'].includes(
              filterDefinitionUsedInDropdown.type,
            ) && <ObjectFilterDropdownNumberInput />}
            {filterDefinitionUsedInDropdown.type === 'RATING' && (
              <ObjectFilterDropdownRatingInput />
            )}
            {['DATE_TIME', 'DATE'].includes(
              filterDefinitionUsedInDropdown.type,
            ) && <ObjectFilterDropdownDateInput />}
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
      ) : (
        <ObjectFilterDropdownOperandButton />
      )}
      <MultipleFiltersDropdownFilterOnFilterChangedEffect
        filterDefinitionUsedInDropdownType={
          filterDefinitionUsedInDropdown?.type
        }
      />
    </>
  );
};
