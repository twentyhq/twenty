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
          ].includes(filterDefinitionUsedInDropdown.type) &&
            !isActorSourceCompositeFilter(filterDefinitionUsedInDropdown) && (
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
              <ObjectFilterDropdownRecordSelect />
            </>
          )}
          {isActorSourceCompositeFilter(filterDefinitionUsedInDropdown) && (
            <>
              <DropdownMenuSeparator />
              <ObjectFilterDropdownSourceSelect />
            </>
          )}
          {filterDefinitionUsedInDropdown.type === 'SELECT' && (
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
