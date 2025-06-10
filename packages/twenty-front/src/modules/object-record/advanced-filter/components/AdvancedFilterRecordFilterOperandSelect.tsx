import { DEFAULT_ADVANCED_FILTER_DROPDOWN_OFFSET } from '@/object-record/advanced-filter/constants/DefaultAdvancedFilterDropdownOffset';
import { AdvancedFilterContext } from '@/object-record/advanced-filter/states/context/AdvancedFilterContext';
import { useApplyObjectFilterDropdownOperand } from '@/object-record/object-filter-dropdown/hooks/useApplyObjectFilterDropdownOperand';

import { getOperandLabel } from '@/object-record/object-filter-dropdown/utils/getOperandLabel';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { getRecordFilterOperands } from '@/object-record/record-filter/utils/getRecordFilterOperands';
import { SelectControl } from '@/ui/input/components/SelectControl';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { selectedItemIdComponentState } from '@/ui/layout/selectable-list/states/selectedItemIdComponentState';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { ViewFilterOperand } from '@/views/types/ViewFilterOperand';
import styled from '@emotion/styled';
import { useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { MenuItem } from 'twenty-ui/navigation';

const StyledContainer = styled.div<{ isColumn?: boolean }>`
  width: ${({ isColumn }) => (isColumn ? 'auto' : '100px')};
`;

type AdvancedFilterRecordFilterOperandSelectProps = {
  recordFilterId: string;
};

export const AdvancedFilterRecordFilterOperandSelect = ({
  recordFilterId,
}: AdvancedFilterRecordFilterOperandSelectProps) => {
  const dropdownId = `advanced-filter-view-filter-operand-${recordFilterId}`;

  const currentRecordFilters = useRecoilComponentValueV2(
    currentRecordFiltersComponentState,
  );

  const { isColumn } = useContext(AdvancedFilterContext);

  const filter = currentRecordFilters.find(
    (recordFilter) => recordFilter.id === recordFilterId,
  );

  const isDisabled = !filter?.fieldMetadataId;

  const { closeDropdown } = useDropdown(dropdownId);

  const { applyObjectFilterDropdownOperand } =
    useApplyObjectFilterDropdownOperand();

  const handleOperandChange = (operand: ViewFilterOperand) => {
    closeDropdown();

    applyObjectFilterDropdownOperand(operand);
  };

  const filterType = filter?.type;

  const operandsForFilterType = isDefined(filterType)
    ? getRecordFilterOperands({
        filterType,
        subFieldName: filter?.subFieldName,
      })
    : [];

  const selectedItemId = useRecoilComponentValueV2(
    selectedItemIdComponentState,
    dropdownId,
  );

  if (isDisabled === true) {
    return (
      <SelectControl
        selectedOption={{
          label: filter?.operand
            ? getOperandLabel(filter.operand)
            : 'Select operand',
          value: null,
        }}
        isDisabled
      />
    );
  }

  return (
    <StyledContainer isColumn={isColumn}>
      <Dropdown
        dropdownId={dropdownId}
        clickableComponent={
          <SelectControl
            selectedOption={{
              label: filter.operand
                ? getOperandLabel(filter.operand)
                : 'Select operand',
              value: null,
            }}
          />
        }
        dropdownComponents={
          <DropdownContent widthInPixels={GenericDropdownContentWidth.Narrow}>
            <DropdownMenuItemsContainer>
              <SelectableList
                hotkeyScope={dropdownId}
                selectableItemIdArray={operandsForFilterType.map(
                  (operand) => operand,
                )}
                selectableListInstanceId={dropdownId}
              >
                {operandsForFilterType.map((filterOperand, index) => (
                  <SelectableListItem
                    itemId={filterOperand}
                    key={`select-filter-operand-${index}`}
                    onEnter={() => {
                      handleOperandChange(filterOperand);
                    }}
                  >
                    <MenuItem
                      focused={selectedItemId === filterOperand}
                      onClick={() => {
                        handleOperandChange(filterOperand);
                      }}
                      text={getOperandLabel(filterOperand)}
                    />
                  </SelectableListItem>
                ))}
              </SelectableList>
            </DropdownMenuItemsContainer>
          </DropdownContent>
        }
        dropdownHotkeyScope={{ scope: dropdownId }}
        dropdownOffset={DEFAULT_ADVANCED_FILTER_DROPDOWN_OFFSET}
        dropdownPlacement="bottom-start"
      />
    </StyledContainer>
  );
};
