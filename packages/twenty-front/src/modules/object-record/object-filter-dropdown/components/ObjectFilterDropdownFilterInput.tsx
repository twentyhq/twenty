import { ObjectFilterDropdownDateInput } from '@/object-record/object-filter-dropdown/components/ObjectFilterDropdownDateInput';
import { ObjectFilterDropdownNumberInput } from '@/object-record/object-filter-dropdown/components/ObjectFilterDropdownNumberInput';
import { ObjectFilterDropdownOptionSelect } from '@/object-record/object-filter-dropdown/components/ObjectFilterDropdownOptionSelect';
import { ObjectFilterDropdownRatingInput } from '@/object-record/object-filter-dropdown/components/ObjectFilterDropdownRatingInput';
import { ObjectFilterDropdownRecordSelect } from '@/object-record/object-filter-dropdown/components/ObjectFilterDropdownRecordSelect';
import { ObjectFilterDropdownSearchInput } from '@/object-record/object-filter-dropdown/components/ObjectFilterDropdownSearchInput';
import { ObjectFilterDropdownSourceSelect } from '@/object-record/object-filter-dropdown/components/ObjectFilterDropdownSourceSelect';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { ViewFilterOperand } from '@/views/types/ViewFilterOperand';

import { getFilterTypeFromFieldType } from '@/object-metadata/utils/formatFieldMetadataItemsAsFilterDefinitions';
import { ObjectFilterDropdownBooleanSelect } from '@/object-record/object-filter-dropdown/components/ObjectFilterDropdownBooleanSelect';
import { ObjectFilterDropdownCurrencySelect } from '@/object-record/object-filter-dropdown/components/ObjectFilterDropdownCurrencySelect';
import { ObjectFilterDropdownTextInput } from '@/object-record/object-filter-dropdown/components/ObjectFilterDropdownTextInput';
import { DATE_FILTER_TYPES } from '@/object-record/object-filter-dropdown/constants/DateFilterTypes';
import { NUMBER_FILTER_TYPES } from '@/object-record/object-filter-dropdown/constants/NumberFilterTypes';
import { TEXT_FILTER_TYPES } from '@/object-record/object-filter-dropdown/constants/TextFilterTypes';
import { fieldMetadataItemUsedInDropdownComponentSelector } from '@/object-record/object-filter-dropdown/states/fieldMetadataItemUsedInDropdownComponentSelector';
import { selectedOperandInDropdownComponentState } from '@/object-record/object-filter-dropdown/states/selectedOperandInDropdownComponentState';
import { subFieldNameUsedInDropdownComponentState } from '@/object-record/object-filter-dropdown/states/subFieldNameUsedInDropdownComponentState';
import { isExpectedSubFieldName } from '@/object-record/object-filter-dropdown/utils/isExpectedSubFieldName';
import { isFilterOnActorSourceSubField } from '@/object-record/object-filter-dropdown/utils/isFilterOnActorSourceSubField';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

type ObjectFilterDropdownFilterInputProps = {
  filterDropdownId?: string;
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

  const subFieldNameUsedInDropdown = useRecoilComponentValueV2(
    subFieldNameUsedInDropdownComponentState,
    filterDropdownId,
  );

  const selectedOperandInDropdown = useRecoilComponentValueV2(
    selectedOperandInDropdownComponentState,
    filterDropdownId,
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

  if (!isDefined(fieldMetadataItemUsedInDropdown)) {
    return null;
  }

  const filterType = getFilterTypeFromFieldType(
    fieldMetadataItemUsedInDropdown.type,
  );

  const isActorSourceCompositeFilter = isFilterOnActorSourceSubField(
    subFieldNameUsedInDropdown,
  );

  const isNotASubFieldFilter = !isDefined(subFieldNameUsedInDropdown);

  return (
    <>
      {isConfigurable && selectedOperandInDropdown && (
        <>
          {TEXT_FILTER_TYPES.includes(filterType) && (
            <ObjectFilterDropdownTextInput />
          )}
          {NUMBER_FILTER_TYPES.includes(filterType) && (
            <ObjectFilterDropdownNumberInput />
          )}
          {filterType === 'RATING' && <ObjectFilterDropdownRatingInput />}
          {DATE_FILTER_TYPES.includes(filterType) && (
            <ObjectFilterDropdownDateInput />
          )}
          {filterType === 'RELATION' && (
            <>
              <ObjectFilterDropdownSearchInput />
              <DropdownMenuSeparator />
              <ObjectFilterDropdownRecordSelect
                recordFilterId={recordFilterId}
              />
            </>
          )}
          {filterType === 'ACTOR' &&
            (isActorSourceCompositeFilter || isNotASubFieldFilter ? (
              <>
                <ObjectFilterDropdownSourceSelect />
              </>
            ) : (
              <>
                <ObjectFilterDropdownTextInput />
              </>
            ))}
          {filterType === 'ADDRESS' &&
            (isNotASubFieldFilter ? (
              <>
                <ObjectFilterDropdownTextInput />
              </>
            ) : (
              <></>
            ))}
          {filterType === 'CURRENCY' &&
            (isExpectedSubFieldName(
              FieldMetadataType.CURRENCY,
              'currencyCode',
              subFieldNameUsedInDropdown,
            ) ? (
              <>
                <ObjectFilterDropdownCurrencySelect />
              </>
            ) : isExpectedSubFieldName(
                FieldMetadataType.CURRENCY,
                'amountMicros',
                subFieldNameUsedInDropdown,
              ) ? (
              <>
                <ObjectFilterDropdownNumberInput />
              </>
            ) : (
              <ObjectFilterDropdownNumberInput />
            ))}
          {['SELECT', 'MULTI_SELECT'].includes(filterType) && (
            <>
              <ObjectFilterDropdownSearchInput />
              <DropdownMenuSeparator />
              <ObjectFilterDropdownOptionSelect />
            </>
          )}
          {filterType === 'BOOLEAN' && <ObjectFilterDropdownBooleanSelect />}
        </>
      )}
    </>
  );
};
