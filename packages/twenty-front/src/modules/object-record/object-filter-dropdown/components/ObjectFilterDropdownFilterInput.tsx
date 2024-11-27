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
import { isActorSourceCompositeFilter } from '@/object-record/object-filter-dropdown/utils/isActorSourceCompositeFilter';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { ViewFilterOperand } from '@/views/types/ViewFilterOperand';
import { isDefined } from 'twenty-ui';

import { ObjectFilterDropdownBooleanSelect } from '@/object-record/object-filter-dropdown/components/ObjectFilterDropdownBooleanSelect';
import { DATE_FILTER_TYPES } from '@/object-record/object-filter-dropdown/constants/DateFilterTypes';
import { NUMBER_FILTER_TYPES } from '@/object-record/object-filter-dropdown/constants/NumberFilterTypes';
import { TEXT_FILTER_TYPES } from '@/object-record/object-filter-dropdown/constants/TextFilterTypes';

type ObjectFilterDropdownFilterInputProps = {
  filterDropdownId?: string;
};

export const ObjectFilterDropdownFilterInput = ({
  filterDropdownId,
}: ObjectFilterDropdownFilterInputProps) => {
  const {
    filterDefinitionUsedInDropdownState,
    selectedOperandInDropdownState,
  } = useFilterDropdown({ filterDropdownId });

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

  return (
    <>
      {isConfigurable && selectedOperandInDropdown && (
        <>
          {TEXT_FILTER_TYPES.includes(filterDefinitionUsedInDropdown.type) &&
            !isActorSourceCompositeFilter(filterDefinitionUsedInDropdown) && (
              <ObjectFilterDropdownTextSearchInput />
            )}
          {NUMBER_FILTER_TYPES.includes(
            filterDefinitionUsedInDropdown.type,
          ) && <ObjectFilterDropdownNumberInput />}
          {filterDefinitionUsedInDropdown.type === 'RATING' && (
            <ObjectFilterDropdownRatingInput />
          )}
          {DATE_FILTER_TYPES.includes(filterDefinitionUsedInDropdown.type) && (
            <ObjectFilterDropdownDateInput />
          )}
          {filterDefinitionUsedInDropdown.type === 'RELATION' && (
            <>
              <ObjectFilterDropdownSearchInput />
              <DropdownMenuSeparator />
              <ObjectFilterDropdownRecordSelect />
            </>
          )}
          {isActorSourceCompositeFilter(filterDefinitionUsedInDropdown) && (
            <>
              <DropdownMenuSeparator />
              <ObjectFilterDropdownSourceSelect />
            </>
          )}
          {['SELECT', 'MULTI_SELECT'].includes(
            filterDefinitionUsedInDropdown.type,
          ) && (
            <>
              <ObjectFilterDropdownSearchInput />
              <DropdownMenuSeparator />
              <ObjectFilterDropdownOptionSelect />
            </>
          )}
          {filterDefinitionUsedInDropdown.type === 'BOOLEAN' && (
            <ObjectFilterDropdownBooleanSelect />
          )}
        </>
      )}
    </>
  );
};
