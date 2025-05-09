import { ObjectFilterDropdownOptionSelect } from '@/object-record/object-filter-dropdown/components/ObjectFilterDropdownOptionSelect';
import { ObjectFilterDropdownRatingInput } from '@/object-record/object-filter-dropdown/components/ObjectFilterDropdownRatingInput';
import { ObjectFilterDropdownRecordSelect } from '@/object-record/object-filter-dropdown/components/ObjectFilterDropdownRecordSelect';
import { ObjectFilterDropdownSearchInput } from '@/object-record/object-filter-dropdown/components/ObjectFilterDropdownSearchInput';
import { ObjectFilterDropdownSourceSelect } from '@/object-record/object-filter-dropdown/components/ObjectFilterDropdownSourceSelect';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';

import { AdvancedFilterDropdownTextInput } from '@/object-record/advanced-filter/components/AdvancedFilterDropdownTextInput';
import { ObjectFilterDropdownBooleanSelect } from '@/object-record/object-filter-dropdown/components/ObjectFilterDropdownBooleanSelect';
import { ObjectFilterDropdownCountrySelect } from '@/object-record/object-filter-dropdown/components/ObjectFilterDropdownCountrySelect';
import { ObjectFilterDropdownCurrencySelect } from '@/object-record/object-filter-dropdown/components/ObjectFilterDropdownCurrencySelect';
import { ObjectFilterDropdownDateInput } from '@/object-record/object-filter-dropdown/components/ObjectFilterDropdownDateInput';
import { ObjectFilterDropdownTextInput } from '@/object-record/object-filter-dropdown/components/ObjectFilterDropdownTextInput';
import { DATE_FILTER_TYPES } from '@/object-record/object-filter-dropdown/constants/DateFilterTypes';
import { subFieldNameUsedInDropdownComponentState } from '@/object-record/object-filter-dropdown/states/subFieldNameUsedInDropdownComponentState';
import { isExpectedSubFieldName } from '@/object-record/object-filter-dropdown/utils/isExpectedSubFieldName';
import { isFilterOnActorSourceSubField } from '@/object-record/object-filter-dropdown/utils/isFilterOnActorSourceSubField';
import { RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { FieldMetadataType } from 'twenty-shared/types';

type AdvancedFilterDropdownFilterInputProps = {
  filterDropdownId?: string;
  recordFilter: RecordFilter;
};

export const AdvancedFilterDropdownFilterInput = ({
  filterDropdownId,
  recordFilter,
}: AdvancedFilterDropdownFilterInputProps) => {
  const subFieldNameUsedInDropdown = useRecoilComponentValueV2(
    subFieldNameUsedInDropdownComponentState,
    filterDropdownId,
  );

  const filterType = recordFilter.type;

  const isActorSourceCompositeFilter = isFilterOnActorSourceSubField(
    subFieldNameUsedInDropdown,
  );

  return (
    <>
      {filterType === 'ADDRESS' &&
        (subFieldNameUsedInDropdown === 'addressCountry' ? (
          <ObjectFilterDropdownCountrySelect />
        ) : (
          <AdvancedFilterDropdownTextInput recordFilter={recordFilter} />
        ))}
      {filterType === 'RATING' && <ObjectFilterDropdownRatingInput />}
      {DATE_FILTER_TYPES.includes(filterType) && (
        <ObjectFilterDropdownDateInput />
      )}
      {filterType === 'RELATION' && (
        <>
          <ObjectFilterDropdownSearchInput />
          <DropdownMenuSeparator />
          <ObjectFilterDropdownRecordSelect recordFilterId={recordFilter.id} />
        </>
      )}
      {filterType === 'ACTOR' &&
        (isActorSourceCompositeFilter ? (
          <>
            <ObjectFilterDropdownSourceSelect />
          </>
        ) : (
          <>
            <ObjectFilterDropdownTextInput />
          </>
        ))}
      {['SELECT', 'MULTI_SELECT'].includes(filterType) && (
        <>
          <ObjectFilterDropdownSearchInput />
          <DropdownMenuSeparator />
          <ObjectFilterDropdownOptionSelect />
        </>
      )}
      {filterType === 'BOOLEAN' && <ObjectFilterDropdownBooleanSelect />}
      {filterType === 'CURRENCY' &&
        (isExpectedSubFieldName(
          FieldMetadataType.CURRENCY,
          'currencyCode',
          recordFilter.subFieldName,
        ) ? (
          <>
            <ObjectFilterDropdownCurrencySelect />
          </>
        ) : (
          <></>
        ))}
    </>
  );
};
