import { ObjectFilterDropdownOptionSelect } from '@/object-record/object-filter-dropdown/components/ObjectFilterDropdownOptionSelect';
import { ObjectFilterDropdownRatingInput } from '@/object-record/object-filter-dropdown/components/ObjectFilterDropdownRatingInput';
import { ObjectFilterDropdownRecordSelect } from '@/object-record/object-filter-dropdown/components/ObjectFilterDropdownRecordSelect';
import { ObjectFilterDropdownSearchInput } from '@/object-record/object-filter-dropdown/components/ObjectFilterDropdownSearchInput';
import { ObjectFilterDropdownSourceSelect } from '@/object-record/object-filter-dropdown/components/ObjectFilterDropdownSourceSelect';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';

import { AdvancedFilterDropdownDateInput } from '@/object-record/advanced-filter/components/AdvancedFilterDropdownDateInput';
import { ObjectFilterDropdownBooleanSelect } from '@/object-record/object-filter-dropdown/components/ObjectFilterDropdownBooleanSelect';
import { ObjectFilterDropdownTextInput } from '@/object-record/object-filter-dropdown/components/ObjectFilterDropdownTextInput';
import { DATE_FILTER_TYPES } from '@/object-record/object-filter-dropdown/constants/DateFilterTypes';
import { subFieldNameUsedInDropdownComponentState } from '@/object-record/object-filter-dropdown/states/subFieldNameUsedInDropdownComponentState';
import { isFilterOnActorSourceSubField } from '@/object-record/object-filter-dropdown/utils/isFilterOnActorSourceSubField';
import { RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';

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
      {filterType === 'RATING' && <ObjectFilterDropdownRatingInput />}
      {DATE_FILTER_TYPES.includes(filterType) && (
        <AdvancedFilterDropdownDateInput />
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
    </>
  );
};
