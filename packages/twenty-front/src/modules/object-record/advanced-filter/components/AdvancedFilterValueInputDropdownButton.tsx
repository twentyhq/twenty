import { AdvancedFilterValueInputDropdownButtonClickableSelect } from '@/object-record/advanced-filter/components/AdvancedFilterValueInputDropdownButtonClickableSelect';
import { DEFAULT_ADVANCED_FILTER_DROPDOWN_OFFSET } from '@/object-record/advanced-filter/constants/DefaultAdvancedFilterDropdownOffset';
import { ObjectFilterDropdownFilterInput } from '@/object-record/object-filter-dropdown/components/ObjectFilterDropdownFilterInput';
import { fieldMetadataItemIdUsedInDropdownComponentState } from '@/object-record/object-filter-dropdown/states/fieldMetadataItemIdUsedInDropdownComponentState';
import { selectedFilterComponentState } from '@/object-record/object-filter-dropdown/states/selectedFilterComponentState';
import { selectedOperandInDropdownComponentState } from '@/object-record/object-filter-dropdown/states/selectedOperandInDropdownComponentState';
import { configurableViewFilterOperands } from '@/object-record/object-filter-dropdown/utils/configurableViewFilterOperands';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentStateV2';

import styled from '@emotion/styled';

const StyledValueDropdownContainer = styled.div`
  flex: 3;
`;

type AdvancedFilterValueInputDropdownButtonProps = {
  recordFilterId: string;
};

export const AdvancedFilterValueInputDropdownButton = ({
  recordFilterId,
}: AdvancedFilterValueInputDropdownButtonProps) => {
  const dropdownId = `advanced-filter-view-filter-value-input-${recordFilterId}`;

  const currentRecordFilters = useRecoilComponentValueV2(
    currentRecordFiltersComponentState,
  );

  const filter = currentRecordFilters.find(
    (recordFilter) => recordFilter.id === recordFilterId,
  );

  const isDisabled = !filter?.fieldMetadataId || !filter.operand;

  const setFieldMetadataItemIdUsedInDropdown = useSetRecoilComponentStateV2(
    fieldMetadataItemIdUsedInDropdownComponentState,
  );

  const setSelectedOperandInDropdown = useSetRecoilComponentStateV2(
    selectedOperandInDropdownComponentState,
  );

  const setSelectedFilter = useSetRecoilComponentStateV2(
    selectedFilterComponentState,
  );

  const operandHasNoInput =
    filter && !configurableViewFilterOperands.has(filter.operand);

  return (
    <StyledValueDropdownContainer>
      {operandHasNoInput ? (
        <></>
      ) : isDisabled ? (
        <AdvancedFilterValueInputDropdownButtonClickableSelect
          recordFilterId={recordFilterId}
        />
      ) : (
        <Dropdown
          dropdownId={dropdownId}
          clickableComponent={
            <AdvancedFilterValueInputDropdownButtonClickableSelect
              recordFilterId={recordFilterId}
            />
          }
          onOpen={() => {
            setFieldMetadataItemIdUsedInDropdown(filter.fieldMetadataId);
            setSelectedOperandInDropdown(filter.operand);
            setSelectedFilter(filter);
          }}
          dropdownComponents={
            <ObjectFilterDropdownFilterInput recordFilterId={filter.id} />
          }
          dropdownHotkeyScope={{ scope: dropdownId }}
          dropdownOffset={DEFAULT_ADVANCED_FILTER_DROPDOWN_OFFSET}
          dropdownPlacement="bottom-start"
          dropdownMenuWidth={280}
        />
      )}
    </StyledValueDropdownContainer>
  );
};
