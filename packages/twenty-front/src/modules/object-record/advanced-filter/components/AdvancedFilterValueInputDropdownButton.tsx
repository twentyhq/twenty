import { ObjectFilterDropdownFilterInput } from '@/object-record/object-filter-dropdown/components/ObjectFilterDropdownFilterInput';
import { fieldMetadataItemIdUsedInDropdownComponentState } from '@/object-record/object-filter-dropdown/states/fieldMetadataItemIdUsedInDropdownComponentState';
import { selectedFilterComponentState } from '@/object-record/object-filter-dropdown/states/selectedFilterComponentState';
import { selectedOperandInDropdownComponentState } from '@/object-record/object-filter-dropdown/states/selectedOperandInDropdownComponentState';
import { configurableViewFilterOperands } from '@/object-record/object-filter-dropdown/utils/configurableViewFilterOperands';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { SelectControl } from '@/ui/input/components/SelectControl';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
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
        <SelectControl
          isDisabled
          selectedOption={{
            label: filter?.displayValue ?? '',
            value: null,
          }}
        />
      ) : (
        <Dropdown
          dropdownId={dropdownId}
          clickableComponent={
            <SelectControl
              selectedOption={{
                label: filter?.displayValue ?? '',
                value: null,
              }}
            />
          }
          onOpen={() => {
            setFieldMetadataItemIdUsedInDropdown(filter.fieldMetadataId);
            setSelectedOperandInDropdown(filter.operand);
            setSelectedFilter(filter);
          }}
          dropdownComponents={
            <DropdownMenuItemsContainer>
              <ObjectFilterDropdownFilterInput />
            </DropdownMenuItemsContainer>
          }
          dropdownHotkeyScope={{ scope: dropdownId }}
          dropdownOffset={{ y: 8, x: 0 }}
          dropdownPlacement="bottom-start"
          dropdownMenuWidth={280}
        />
      )}
    </StyledValueDropdownContainer>
  );
};
