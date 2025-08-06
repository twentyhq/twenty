import { ObjectFilterDropdownDateInput } from '@/object-record/object-filter-dropdown/components/ObjectFilterDropdownDateInput';
import { ObjectFilterDropdownNumberInput } from '@/object-record/object-filter-dropdown/components/ObjectFilterDropdownNumberInput';
import { ObjectFilterDropdownOptionSelect } from '@/object-record/object-filter-dropdown/components/ObjectFilterDropdownOptionSelect';
import { ObjectFilterDropdownRatingInput } from '@/object-record/object-filter-dropdown/components/ObjectFilterDropdownRatingInput';
import { ObjectFilterDropdownRecordSelect } from '@/object-record/object-filter-dropdown/components/ObjectFilterDropdownRecordSelect';
import { ObjectFilterDropdownSearchInput } from '@/object-record/object-filter-dropdown/components/ObjectFilterDropdownSearchInput';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';

import { ViewFilterOperand } from 'twenty-shared/src/types/ViewFilterOperand';

import { getFilterTypeFromFieldType } from '@/object-metadata/utils/formatFieldMetadataItemsAsFilterDefinitions';
import { ObjectFilterDropdownBooleanSelect } from '@/object-record/object-filter-dropdown/components/ObjectFilterDropdownBooleanSelect';
import { ObjectFilterDropdownInnerSelectOperandDropdown } from '@/object-record/object-filter-dropdown/components/ObjectFilterDropdownInnerSelectOperandDropdown';
import { ObjectFilterDropdownTextInput } from '@/object-record/object-filter-dropdown/components/ObjectFilterDropdownTextInput';
import { ObjectFilterDropdownVectorSearchInput } from '@/object-record/object-filter-dropdown/components/ObjectFilterDropdownVectorSearchInput';
import { DATE_FILTER_TYPES } from '@/object-record/object-filter-dropdown/constants/DateFilterTypes';
import { NUMBER_FILTER_TYPES } from '@/object-record/object-filter-dropdown/constants/NumberFilterTypes';
import { TEXT_FILTER_TYPES } from '@/object-record/object-filter-dropdown/constants/TextFilterTypes';
import { fieldMetadataItemUsedInDropdownComponentSelector } from '@/object-record/object-filter-dropdown/states/fieldMetadataItemUsedInDropdownComponentSelector';
import { selectedOperandInDropdownComponentState } from '@/object-record/object-filter-dropdown/states/selectedOperandInDropdownComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { isDefined } from 'twenty-shared/utils';

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
    filterDropdownId,
  );

  const selectedOperandInDropdown = useRecoilComponentValue(
    selectedOperandInDropdownComponentState,
    filterDropdownId,
  );

  const isOperandWithFilterValue =
    selectedOperandInDropdown &&
    [
      ViewFilterOperand.Is,
      ViewFilterOperand.IsNotNull,
      ViewFilterOperand.IsNot,
      ViewFilterOperand.LessThanOrEqual,
      ViewFilterOperand.GreaterThanOrEqual,
      ViewFilterOperand.IsBefore,
      ViewFilterOperand.IsAfter,
      ViewFilterOperand.Contains,
      ViewFilterOperand.DoesNotContain,
      ViewFilterOperand.IsRelative,
    ].includes(selectedOperandInDropdown);

  const isVectorSearchFilter =
    selectedOperandInDropdown === ViewFilterOperand.VectorSearch;

  if (isVectorSearchFilter && isDefined(filterDropdownId)) {
    return <ObjectFilterDropdownVectorSearchInput />;
  }

  if (!isDefined(fieldMetadataItemUsedInDropdown)) {
    return null;
  }

  const filterType = getFilterTypeFromFieldType(
    fieldMetadataItemUsedInDropdown.type,
  );

  const isDateFilter = DATE_FILTER_TYPES.includes(filterType);
  const isOnlyOperand = !isOperandWithFilterValue;

  if (isOnlyOperand) {
    return (
      <>
        <ObjectFilterDropdownInnerSelectOperandDropdown />
      </>
    );
  } else if (isDateFilter) {
    return (
      <>
        <ObjectFilterDropdownInnerSelectOperandDropdown />
        <DropdownMenuSeparator />
        <ObjectFilterDropdownDateInput />
      </>
    );
  } else {
    return (
      <>
        <ObjectFilterDropdownInnerSelectOperandDropdown />
        <DropdownMenuSeparator />
        {TEXT_FILTER_TYPES.includes(filterType) && (
          <ObjectFilterDropdownTextInput />
        )}
        {NUMBER_FILTER_TYPES.includes(filterType) && (
          <ObjectFilterDropdownNumberInput />
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
        {filterType === 'ACTOR' && <ObjectFilterDropdownTextInput />}
        {filterType === 'ADDRESS' && <ObjectFilterDropdownTextInput />}
        {filterType === 'CURRENCY' && <ObjectFilterDropdownNumberInput />}
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
