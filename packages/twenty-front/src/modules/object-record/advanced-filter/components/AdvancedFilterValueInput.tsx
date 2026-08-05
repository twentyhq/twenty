import { AdvancedFilterDropdownFilterInput } from '@/object-record/advanced-filter/components/AdvancedFilterDropdownFilterInput';
import { AdvancedFilterDropdownTextInput } from '@/object-record/advanced-filter/components/AdvancedFilterDropdownTextInput';
import { AdvancedFilterValueInputDropdownButtonClickableSelect } from '@/object-record/advanced-filter/components/AdvancedFilterValueInputDropdownButtonClickableSelect';
import { DEFAULT_ADVANCED_FILTER_DROPDOWN_OFFSET } from '@/object-record/advanced-filter/constants/DefaultAdvancedFilterDropdownOffset';
import { useSetRecordFilterUsedInAdvancedFilterDropdownRow } from '@/object-record/advanced-filter/hooks/useSetRecordFilterUsedInAdvancedFilterDropdownRow';
import { getAdvancedFilterObjectFilterDropdownComponentInstanceId } from '@/object-record/advanced-filter/utils/getAdvancedFilterObjectFilterDropdownComponentInstanceId';
import { shouldShowFilterTextInput } from '@/object-record/advanced-filter/utils/shouldShowFilterTextInput';
import { objectFilterDropdownSearchInputComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownSearchInputComponentState';
import { subFieldNameUsedInDropdownComponentState } from '@/object-record/object-filter-dropdown/states/subFieldNameUsedInDropdownComponentState';
import { configurableViewFilterOperands } from '@/object-record/object-filter-dropdown/utils/configurableViewFilterOperands';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { type DropdownOffset } from '@/ui/layout/dropdown/types/DropdownOffset';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';

import { styled } from '@linaria/react';
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

  // The dropdown content components read the object filter dropdown states
  // from the row's instance, not from this dropdown's id.
  const objectFilterDropdownInstanceId =
    getAdvancedFilterObjectFilterDropdownComponentInstanceId(recordFilterId);

  const currentRecordFilters = useAtomComponentStateValue(
    currentRecordFiltersComponentState,
  );

  const subFieldNameUsedInDropdown = useAtomComponentStateValue(
    subFieldNameUsedInDropdownComponentState,
    objectFilterDropdownInstanceId,
  );

  const recordFilter = currentRecordFilters.find(
    (recordFilter) => recordFilter.id === recordFilterId,
  );

  const isDisabled = !recordFilter?.fieldMetadataId || !recordFilter.operand;

  const setObjectFilterDropdownSearchInput = useSetAtomComponentState(
    objectFilterDropdownSearchInputComponentState,
    objectFilterDropdownInstanceId,
  );

  const { setRecordFilterUsedInAdvancedFilterDropdownRow } =
    useSetRecordFilterUsedInAdvancedFilterDropdownRow();

  const operandHasNoInput =
    recordFilter && !configurableViewFilterOperands.has(recordFilter.operand);

  if (!isDefined(recordFilter)) {
    return null;
  }

  const handleFilterValueDropdownClose = () => {
    setObjectFilterDropdownSearchInput('');
  };

  const handleFilterValueDropdownOpen = () => {
    setRecordFilterUsedInAdvancedFilterDropdownRow(recordFilter);
  };

  const filterType = recordFilter.type;

  const dropdownContentOffset =
    filterType === 'DATE' || filterType === 'DATE_TIME'
      ? ({ y: -33, x: 0 } satisfies DropdownOffset)
      : DEFAULT_ADVANCED_FILTER_DROPDOWN_OFFSET;

  const showFilterTextInputInsteadOfDropdown = shouldShowFilterTextInput({
    recordFilter,
    subFieldNameUsedInDropdown,
  });

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
            <AdvancedFilterDropdownFilterInput
              recordFilter={recordFilter}
              filterDropdownId={dropdownId}
            />
          }
          dropdownOffset={dropdownContentOffset}
          dropdownPlacement="bottom-start"
          onClose={handleFilterValueDropdownClose}
          onOpen={handleFilterValueDropdownOpen}
        />
      )}
    </StyledValueDropdownContainer>
  );
};
