import { ObjectFilterDropdownDateInput } from '@/object-record/object-filter-dropdown/components/ObjectFilterDropdownDateInput';
import { ObjectFilterDropdownNumberInput } from '@/object-record/object-filter-dropdown/components/ObjectFilterDropdownNumberInput';
import { ObjectFilterDropdownOptionSelect } from '@/object-record/object-filter-dropdown/components/ObjectFilterDropdownOptionSelect';
import { ObjectFilterDropdownRatingInput } from '@/object-record/object-filter-dropdown/components/ObjectFilterDropdownRatingInput';
import { ObjectFilterDropdownRecordSelect } from '@/object-record/object-filter-dropdown/components/ObjectFilterDropdownRecordSelect';
import { ObjectFilterDropdownSearchInput } from '@/object-record/object-filter-dropdown/components/ObjectFilterDropdownSearchInput';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';

import { ViewFilterOperand } from 'twenty-shared/types';

import { ObjectFilterDropdownBooleanSelect } from '@/object-record/object-filter-dropdown/components/ObjectFilterDropdownBooleanSelect';
import { ObjectFilterDropdownDateTimeInput } from '@/object-record/object-filter-dropdown/components/ObjectFilterDropdownDateTimeInput';
import { ObjectFilterDropdownInnerSelectOperandDropdown } from '@/object-record/object-filter-dropdown/components/ObjectFilterDropdownInnerSelectOperandDropdown';
import { ObjectFilterDropdownTextInput } from '@/object-record/object-filter-dropdown/components/ObjectFilterDropdownTextInput';
import { NUMBER_FILTER_TYPES } from '@/object-record/object-filter-dropdown/constants/NumberFilterTypes';
import { TEXT_FILTER_TYPES } from '@/object-record/object-filter-dropdown/constants/TextFilterTypes';
import { fieldMetadataItemUsedInDropdownComponentSelector } from '@/object-record/object-filter-dropdown/states/fieldMetadataItemUsedInDropdownComponentSelector';
import { selectedOperandInDropdownComponentState } from '@/object-record/object-filter-dropdown/states/selectedOperandInDropdownComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { getFilterTypeFromFieldType, isDefined } from 'twenty-shared/utils';

type ObjectFilterDropdownFilterInputProps = {
  filterDropdownId: string;
  recordFilterId?: string;
};

export const ObjectFilterDropdownFilterInput = ({
  filterDropdownId,
  recordFilterId,
}: ObjectFilterDropdownFilterInputProps) => {
  const fieldMetadataItemUsedInDropdown = useRecoilComponentValue(
    fieldMetadataItemUsedInDropdownComponentSelector,
  );

  const selectedOperandInDropdown = useRecoilComponentValue(
    selectedOperandInDropdownComponentState,
  );

  const isOperandWithFilterValue =
    selectedOperandInDropdown &&
    [
      ViewFilterOperand.IS,
      ViewFilterOperand.IS_NOT_NULL,
      ViewFilterOperand.IS_NOT,
      ViewFilterOperand.LESS_THAN_OR_EQUAL,
      ViewFilterOperand.GREATER_THAN_OR_EQUAL,
      ViewFilterOperand.IS_BEFORE,
      ViewFilterOperand.IS_AFTER,
      ViewFilterOperand.CONTAINS,
      ViewFilterOperand.DOES_NOT_CONTAIN,
      ViewFilterOperand.IS_RELATIVE,
    ].includes(selectedOperandInDropdown);

  if (!isDefined(fieldMetadataItemUsedInDropdown)) {
    return null;
  }

  const filterType = getFilterTypeFromFieldType(
    fieldMetadataItemUsedInDropdown.type,
  );

  const isOnlyOperand = !isOperandWithFilterValue;

  if (isOnlyOperand) {
    return (
      <>
        <ObjectFilterDropdownInnerSelectOperandDropdown />
      </>
    );
  } else if (filterType === 'DATE') {
    return (
      <>
        <ObjectFilterDropdownInnerSelectOperandDropdown />
        <DropdownMenuSeparator />
        <ObjectFilterDropdownDateInput />
      </>
    );
  } else if (filterType === 'DATE_TIME') {
    return (
      <>
        <ObjectFilterDropdownInnerSelectOperandDropdown />
        <DropdownMenuSeparator />
        <ObjectFilterDropdownDateTimeInput />
      </>
    );
  } else {
    return (
      <>
        <ObjectFilterDropdownInnerSelectOperandDropdown />
        <DropdownMenuSeparator />
        {TEXT_FILTER_TYPES.includes(filterType) && (
          <ObjectFilterDropdownTextInput filterDropdownId={filterDropdownId} />
        )}
        {NUMBER_FILTER_TYPES.includes(filterType) && (
          <ObjectFilterDropdownNumberInput
            filterDropdownId={filterDropdownId}
          />
        )}
        {filterType === 'RATING' && <ObjectFilterDropdownRatingInput />}
        {filterType === 'RELATION' && (
          <>
            <ObjectFilterDropdownSearchInput />
            <DropdownMenuSeparator />
            <ObjectFilterDropdownRecordSelect
              recordFilterId={recordFilterId}
              dropdownId={filterDropdownId}
            />
          </>
        )}
        {filterType === 'ACTOR' && (
          <ObjectFilterDropdownTextInput filterDropdownId={filterDropdownId} />
        )}
        {filterType === 'ADDRESS' && (
          <ObjectFilterDropdownTextInput filterDropdownId={filterDropdownId} />
        )}
        {filterType === 'CURRENCY' && (
          <ObjectFilterDropdownNumberInput
            filterDropdownId={filterDropdownId}
          />
        )}
        {['SELECT', 'MULTI_SELECT'].includes(filterType) && (
          <>
            <ObjectFilterDropdownSearchInput />
            <DropdownMenuSeparator />
            <ObjectFilterDropdownOptionSelect focusId={filterDropdownId} />
          </>
        )}
        {filterType === 'BOOLEAN' && <ObjectFilterDropdownBooleanSelect />}
      </>
    );
  }
};
