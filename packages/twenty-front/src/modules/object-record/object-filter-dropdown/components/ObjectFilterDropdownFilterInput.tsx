import { ObjectFilterDropdownDateInput } from '@/object-record/object-filter-dropdown/components/ObjectFilterDropdownDateInput';
import { ObjectFilterDropdownNumberInput } from '@/object-record/object-filter-dropdown/components/ObjectFilterDropdownNumberInput';
import { ObjectFilterDropdownOptionSelect } from '@/object-record/object-filter-dropdown/components/ObjectFilterDropdownOptionSelect';
import { ObjectFilterDropdownRatingInput } from '@/object-record/object-filter-dropdown/components/ObjectFilterDropdownRatingInput';
import { ObjectFilterDropdownRecordSelect } from '@/object-record/object-filter-dropdown/components/ObjectFilterDropdownRecordSelect';
import { ObjectFilterDropdownSearchInput } from '@/object-record/object-filter-dropdown/components/ObjectFilterDropdownSearchInput';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { ViewBarFilterDropdownVectorSearchInput } from '@/views/components/ViewBarFilterDropdownVectorSearchInput';
import { ViewFilterOperand } from '@/views/types/ViewFilterOperand';

import { getFilterTypeFromFieldType } from '@/object-metadata/utils/formatFieldMetadataItemsAsFilterDefinitions';
import { ObjectFilterDropdownBooleanSelect } from '@/object-record/object-filter-dropdown/components/ObjectFilterDropdownBooleanSelect';
import { ObjectFilterDropdownFilterInputHeader } from '@/object-record/object-filter-dropdown/components/ObjectFilterDropdownFilterInputHeader';
import { ObjectFilterDropdownInnerSelectOperandDropdown } from '@/object-record/object-filter-dropdown/components/ObjectFilterDropdownInnerSelectOperandDropdown';
import { ObjectFilterDropdownTextInput } from '@/object-record/object-filter-dropdown/components/ObjectFilterDropdownTextInput';
import { DATE_FILTER_TYPES } from '@/object-record/object-filter-dropdown/constants/DateFilterTypes';
import { DATE_PICKER_DROPDOWN_CONTENT_WIDTH } from '@/object-record/object-filter-dropdown/constants/DatePickerDropdownContentWidth';
import { NUMBER_FILTER_TYPES } from '@/object-record/object-filter-dropdown/constants/NumberFilterTypes';
import { TEXT_FILTER_TYPES } from '@/object-record/object-filter-dropdown/constants/TextFilterTypes';
import { fieldMetadataItemUsedInDropdownComponentSelector } from '@/object-record/object-filter-dropdown/states/fieldMetadataItemUsedInDropdownComponentSelector';
import { selectedOperandInDropdownComponentState } from '@/object-record/object-filter-dropdown/states/selectedOperandInDropdownComponentState';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { isDefined } from 'twenty-shared/utils';

type ObjectFilterDropdownFilterInputProps = {
  filterDropdownId: string;
  recordFilterId?: string;
};

export const ObjectFilterDropdownFilterInput = ({
  filterDropdownId,
  recordFilterId,
}: ObjectFilterDropdownFilterInputProps) => {
  const fieldMetadataItemUsedInDropdown = useRecoilComponentValueV2(
    fieldMetadataItemUsedInDropdownComponentSelector,
    filterDropdownId,
  );

  const selectedOperandInDropdown = useRecoilComponentValueV2(
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
    return (
      <ViewBarFilterDropdownVectorSearchInput
        filterDropdownId={filterDropdownId}
      />
    );
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
      <DropdownContent widthInPixels={GenericDropdownContentWidth.ExtraLarge}>
        <ObjectFilterDropdownFilterInputHeader />
        <ObjectFilterDropdownInnerSelectOperandDropdown />
      </DropdownContent>
    );
  } else if (isDateFilter) {
    return (
      <DropdownContent widthInPixels={DATE_PICKER_DROPDOWN_CONTENT_WIDTH}>
        <ObjectFilterDropdownFilterInputHeader />
        <ObjectFilterDropdownInnerSelectOperandDropdown />
        <DropdownMenuSeparator />
        <ObjectFilterDropdownDateInput />
      </DropdownContent>
    );
  } else {
    return (
      <DropdownContent widthInPixels={GenericDropdownContentWidth.ExtraLarge}>
        <ObjectFilterDropdownFilterInputHeader />
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
      </DropdownContent>
    );
  }
};
