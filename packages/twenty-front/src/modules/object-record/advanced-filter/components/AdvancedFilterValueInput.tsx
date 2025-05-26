import { AdvancedFilterDropdownFilterInput } from '@/object-record/advanced-filter/components/AdvancedFilterDropdownFilterInput';
import { AdvancedFilterDropdownTextInput } from '@/object-record/advanced-filter/components/AdvancedFilterDropdownTextInput';
import { AdvancedFilterValueInputDropdownButtonClickableSelect } from '@/object-record/advanced-filter/components/AdvancedFilterValueInputDropdownButtonClickableSelect';
import { DEFAULT_ADVANCED_FILTER_DROPDOWN_OFFSET } from '@/object-record/advanced-filter/constants/DefaultAdvancedFilterDropdownOffset';
import { NUMBER_FILTER_TYPES } from '@/object-record/object-filter-dropdown/constants/NumberFilterTypes';
import { TEXT_FILTER_TYPES } from '@/object-record/object-filter-dropdown/constants/TextFilterTypes';
import { fieldMetadataItemIdUsedInDropdownComponentState } from '@/object-record/object-filter-dropdown/states/fieldMetadataItemIdUsedInDropdownComponentState';
import { objectFilterDropdownCurrentRecordFilterComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownCurrentRecordFilterComponentState';
import { objectFilterDropdownSearchInputComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownSearchInputComponentState';
import { subFieldNameUsedInDropdownComponentState } from '@/object-record/object-filter-dropdown/states/subFieldNameUsedInDropdownComponentState';
import { configurableViewFilterOperands } from '@/object-record/object-filter-dropdown/utils/configurableViewFilterOperands';
import { isExpectedSubFieldName } from '@/object-record/object-filter-dropdown/utils/isExpectedSubFieldName';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownOffset } from '@/ui/layout/dropdown/types/DropdownOffset';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentStateV2';

import styled from '@emotion/styled';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

const StyledValueDropdownContainer = styled.div`
  flex: 3;
`;

type AdvancedFilterValueInputProps = {
  recordFilterId: string;
};

export const AdvancedFilterValueInput = ({
  recordFilterId,
}: AdvancedFilterValueInputProps) => {
  const dropdownId = `advanced-filter-view-filter-value-input-${recordFilterId}`;

  const currentRecordFilters = useRecoilComponentValueV2(
    currentRecordFiltersComponentState,
  );

  const subFieldNameUsedInDropdown = useRecoilComponentValueV2(
    subFieldNameUsedInDropdownComponentState,
  );

  const recordFilter = currentRecordFilters.find(
    (recordFilter) => recordFilter.id === recordFilterId,
  );

  const isDisabled = !recordFilter?.fieldMetadataId || !recordFilter.operand;

  const setObjectFilterDropdownSearchInput = useSetRecoilComponentStateV2(
    objectFilterDropdownSearchInputComponentState,
  );

  const setFieldMetadataItemIdUsedInDropdown = useSetRecoilComponentStateV2(
    fieldMetadataItemIdUsedInDropdownComponentState,
  );

  const setObjectFilterDropdownCurrentRecordFilter =
    useSetRecoilComponentStateV2(
      objectFilterDropdownCurrentRecordFilterComponentState,
    );

  const operandHasNoInput =
    recordFilter && !configurableViewFilterOperands.has(recordFilter.operand);

  if (!isDefined(recordFilter)) {
    return null;
  }

  const handleFilterValueDropdownClose = () => {
    setObjectFilterDropdownSearchInput('');
  };

  const handleFilterValueDropdownOpen = () => {
    setObjectFilterDropdownCurrentRecordFilter(recordFilter);
    setFieldMetadataItemIdUsedInDropdown(recordFilter.fieldMetadataId);
  };

  const filterType = recordFilter.type;

  const dropdownContentOffset =
    filterType === 'DATE' || filterType === 'DATE_TIME'
      ? ({ y: -33, x: 0 } satisfies DropdownOffset)
      : DEFAULT_ADVANCED_FILTER_DROPDOWN_OFFSET;

  const isFilterableByTextValue =
    isDefined(filterType) &&
    (TEXT_FILTER_TYPES.includes(filterType) ||
      NUMBER_FILTER_TYPES.includes(filterType));

  const isCurrencyAmountMicrosFilter = isExpectedSubFieldName(
    FieldMetadataType.CURRENCY,
    'amountMicros',
    recordFilter.subFieldName,
  );

  const isAddressFilterOnSubFieldOtherThanCountry =
    filterType === 'ADDRESS' && subFieldNameUsedInDropdown !== 'addressCountry';

  const isActorNameFilter = isExpectedSubFieldName(
    FieldMetadataType.ACTOR,
    'name',
    recordFilter.subFieldName,
  );

  const showFilterTextInputInsteadOfDropdown =
    isFilterableByTextValue ||
    isCurrencyAmountMicrosFilter ||
    isAddressFilterOnSubFieldOtherThanCountry ||
    isActorNameFilter;

  return (
    <StyledValueDropdownContainer>
      {operandHasNoInput ? (
        <></>
      ) : isDisabled ? (
        <AdvancedFilterValueInputDropdownButtonClickableSelect
          recordFilterId={recordFilterId}
        />
      ) : showFilterTextInputInsteadOfDropdown ? (
        <AdvancedFilterDropdownTextInput recordFilter={recordFilter} />
      ) : (
        <Dropdown
          dropdownId={dropdownId}
          clickableComponent={
            <AdvancedFilterValueInputDropdownButtonClickableSelect
              recordFilterId={recordFilterId}
            />
          }
          dropdownComponents={
            <AdvancedFilterDropdownFilterInput recordFilter={recordFilter} />
          }
          dropdownHotkeyScope={{ scope: dropdownId }}
          dropdownOffset={dropdownContentOffset}
          dropdownPlacement="bottom-start"
          dropdownWidth={280}
          onClose={handleFilterValueDropdownClose}
          onOpen={handleFilterValueDropdownOpen}
        />
      )}
    </StyledValueDropdownContainer>
  );
};
