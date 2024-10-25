import { useRecoilValue } from 'recoil';

import { ObjectFilterDropdownDateInput } from '@/object-record/object-filter-dropdown/components/ObjectFilterDropdownDateInput';
import { ObjectFilterDropdownNumberInput } from '@/object-record/object-filter-dropdown/components/ObjectFilterDropdownNumberInput';
import { ObjectFilterDropdownOptionSelect } from '@/object-record/object-filter-dropdown/components/ObjectFilterDropdownOptionSelect';
import { ObjectFilterDropdownRatingInput } from '@/object-record/object-filter-dropdown/components/ObjectFilterDropdownRatingInput';
import { ObjectFilterDropdownRecordSelect } from '@/object-record/object-filter-dropdown/components/ObjectFilterDropdownRecordSelect';
import { ObjectFilterDropdownSearchInput } from '@/object-record/object-filter-dropdown/components/ObjectFilterDropdownSearchInput';
import { ObjectFilterDropdownSourceSelect } from '@/object-record/object-filter-dropdown/components/ObjectFilterDropdownSourceSelect';
import { ObjectFilterDropdownTextSearchInput } from '@/object-record/object-filter-dropdown/components/ObjectFilterDropdownTextSearchInput';
import { useFilterDropdown } from '@/object-record/object-filter-dropdown/hooks/useFilterDropdown';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { ViewFilterOperand } from '@/views/types/ViewFilterOperand';
import { isDefined } from 'twenty-ui';

import { getFilterInputTypeToUse } from '@/object-record/object-filter-dropdown/utils/getFilterInputTypeToUse';

type ObjectFilterDropdownFilterInputProps = {
  filterDropdownId?: string;
};

export const ObjectFilterDropdownFilterInput =
  ({}: ObjectFilterDropdownFilterInputProps) => {
    const {
      filterDefinitionUsedInDropdownState,
      selectedOperandInDropdownState,
    } = useFilterDropdown();

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

    if (!isDefined(filterDefinitionUsedInDropdown)) {
      return null;
    }

    const filterInputTypeToUse = getFilterInputTypeToUse(
      filterDefinitionUsedInDropdown,
    );

    console.log({
      filterDefinitionUsedInDropdown,

      filterInputTypeToUse,
    });

    return (
      <>
        {isConfigurable && selectedOperandInDropdown && (
          <>
            {filterInputTypeToUse === 'text' && (
              <ObjectFilterDropdownTextSearchInput />
            )}
            {filterInputTypeToUse === 'number' && (
              <ObjectFilterDropdownNumberInput />
            )}
            {filterInputTypeToUse === 'rating' && (
              <ObjectFilterDropdownRatingInput />
            )}
            {filterInputTypeToUse === 'date' && (
              <ObjectFilterDropdownDateInput />
            )}
            {filterInputTypeToUse === 'relation' && (
              <>
                <ObjectFilterDropdownSearchInput />
                <ObjectFilterDropdownRecordSelect />
              </>
            )}
            {filterInputTypeToUse === 'source' && (
              <>
                <DropdownMenuSeparator />
                <ObjectFilterDropdownSourceSelect />
              </>
            )}
            {filterInputTypeToUse === 'select' && (
              <>
                <ObjectFilterDropdownSearchInput />
                <ObjectFilterDropdownOptionSelect />
              </>
            )}
          </>
        )}
      </>
    );
  };
