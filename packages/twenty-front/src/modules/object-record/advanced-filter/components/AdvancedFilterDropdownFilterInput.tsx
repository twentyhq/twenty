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
import { ObjectFilterDropdownDateTimeInput } from '@/object-record/object-filter-dropdown/components/ObjectFilterDropdownDateTimeInput';
import { ObjectFilterDropdownTextInput } from '@/object-record/object-filter-dropdown/components/ObjectFilterDropdownTextInput';
import { subFieldNameUsedInDropdownComponentState } from '@/object-record/object-filter-dropdown/states/subFieldNameUsedInDropdownComponentState';
import { isFilterOnActorSourceSubField } from '@/object-record/object-filter-dropdown/utils/isFilterOnActorSourceSubField';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { FieldMetadataType } from 'twenty-shared/types';
import { isExpectedSubFieldName } from 'twenty-shared/utils';

type AdvancedFilterDropdownFilterInputProps = {
  filterDropdownId: string;
  recordFilter: RecordFilter;
};

export const AdvancedFilterDropdownFilterInput = ({
  filterDropdownId,
  recordFilter,
}: AdvancedFilterDropdownFilterInputProps) => {
  const subFieldNameUsedInDropdown = useRecoilComponentValue(
    subFieldNameUsedInDropdownComponentState,
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
      {filterType === 'DATE_TIME' && <ObjectFilterDropdownDateTimeInput />}
      {filterType === 'DATE' && <ObjectFilterDropdownDateInput />}
      {filterType === 'RELATION' && (
        <DropdownContent widthInPixels={GenericDropdownContentWidth.ExtraLarge}>
          <ObjectFilterDropdownSearchInput />
          <DropdownMenuSeparator />
          <ObjectFilterDropdownRecordSelect
            recordFilterId={recordFilter.id}
            dropdownId={filterDropdownId}
          />
        </DropdownContent>
      )}
      {filterType === 'ACTOR' &&
        (isActorSourceCompositeFilter ? (
          <ObjectFilterDropdownSourceSelect dropdownId={filterDropdownId} />
        ) : (
          <ObjectFilterDropdownTextInput filterDropdownId={filterDropdownId} />
        ))}
      {['SELECT', 'MULTI_SELECT'].includes(filterType) && (
        <DropdownContent widthInPixels={GenericDropdownContentWidth.ExtraLarge}>
          <ObjectFilterDropdownSearchInput />
          <DropdownMenuSeparator />
          <ObjectFilterDropdownOptionSelect focusId={filterDropdownId} />
        </DropdownContent>
      )}
      {filterType === 'BOOLEAN' && <ObjectFilterDropdownBooleanSelect />}
      {filterType === 'CURRENCY' &&
        (isExpectedSubFieldName(
          FieldMetadataType.CURRENCY,
          'currencyCode',
          recordFilter.subFieldName,
        ) ? (
          <ObjectFilterDropdownCurrencySelect />
        ) : (
          <></>
        ))}
    </>
  );
};
