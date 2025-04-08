import { AdvancedFilterDropdownFilterInput } from '@/object-record/advanced-filter/components/AdvancedFilterDropdownFilterInput';
import { AdvancedFilterDropdownTextInput } from '@/object-record/advanced-filter/components/AdvancedFilterDropdownTextInput';
import { AdvancedFilterValueInputDropdownButtonClickableSelect } from '@/object-record/advanced-filter/components/AdvancedFilterValueInputDropdownButtonClickableSelect';
import { DEFAULT_ADVANCED_FILTER_DROPDOWN_OFFSET } from '@/object-record/advanced-filter/constants/DefaultAdvancedFilterDropdownOffset';
import { NUMBER_FILTER_TYPES } from '@/object-record/object-filter-dropdown/constants/NumberFilterTypes';
import { TEXT_FILTER_TYPES } from '@/object-record/object-filter-dropdown/constants/TextFilterTypes';
import { objectFilterDropdownSearchInputComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownSearchInputComponentState';
import { configurableViewFilterOperands } from '@/object-record/object-filter-dropdown/utils/configurableViewFilterOperands';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownOffset } from '@/ui/layout/dropdown/types/DropdownOffset';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentStateV2';

import styled from '@emotion/styled';
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

  const recordFilter = currentRecordFilters.find(
    (recordFilter) => recordFilter.id === recordFilterId,
  );

  const isDisabled = !recordFilter?.fieldMetadataId || !recordFilter.operand;

  const setObjectFilterDropdownSearchInput = useSetRecoilComponentStateV2(
    objectFilterDropdownSearchInputComponentState,
  );

  const operandHasNoInput =
    recordFilter && !configurableViewFilterOperands.has(recordFilter.operand);

  if (!isDefined(recordFilter)) {
    return null;
  }

  const handleFilterValueDropdownClose = () => {
    setObjectFilterDropdownSearchInput('');
  };

  const filterType = recordFilter.type;

  const dropdownContentOffset =
    filterType === 'DATE' || filterType === 'DATE_TIME'
      ? ({ y: -33, x: 0 } satisfies DropdownOffset)
      : DEFAULT_ADVANCED_FILTER_DROPDOWN_OFFSET;

  return (
    <StyledValueDropdownContainer>
      {operandHasNoInput ? (
        <></>
      ) : isDisabled ? (
        <AdvancedFilterValueInputDropdownButtonClickableSelect
          recordFilterId={recordFilterId}
        />
      ) : isDefined(filterType) &&
        (TEXT_FILTER_TYPES.includes(filterType) ||
          NUMBER_FILTER_TYPES.includes(filterType)) ? (
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
          initialDropdownWidth={280}
          onClose={handleFilterValueDropdownClose}
        />
      )}
    </StyledValueDropdownContainer>
  );
};
