import { NUMBER_FILTER_TYPES } from '@/object-record/object-filter-dropdown/constants/NumberFilterTypes';
import { TEXT_FILTER_TYPES } from '@/object-record/object-filter-dropdown/constants/TextFilterTypes';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';

import { type CompositeFieldSubFieldName } from '@/settings/data-model/types/CompositeFieldSubFieldName';
import { FieldMetadataType } from 'twenty-shared/types';
import { isExpectedSubFieldName } from 'twenty-shared/utils';

export const shouldShowFilterTextInput = ({
  recordFilter,
  subFieldNameUsedInDropdown,
}: {
  recordFilter: RecordFilter;
  subFieldNameUsedInDropdown: CompositeFieldSubFieldName | null | undefined;
}) => {
  const isFilterableByTextValue =
    TEXT_FILTER_TYPES.includes(recordFilter.type) ||
    NUMBER_FILTER_TYPES.includes(recordFilter.type);

  const isCurrencyAmountMicrosFilter = isExpectedSubFieldName(
    FieldMetadataType.CURRENCY,
    'amountMicros',
    recordFilter.subFieldName,
  );

  const isAddressFilterOnSubFieldOtherThanCountry =
    recordFilter.type === 'ADDRESS' &&
    subFieldNameUsedInDropdown !== 'addressCountry';

  const isActorNameFilter = isExpectedSubFieldName(
    FieldMetadataType.ACTOR,
    'name',
    recordFilter.subFieldName,
  );

  return (
    isFilterableByTextValue ||
    isCurrencyAmountMicrosFilter ||
    isAddressFilterOnSubFieldOtherThanCountry ||
    isActorNameFilter
  );
};
