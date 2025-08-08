import { DEFAULT_ADVANCED_FILTER_DROPDOWN_OFFSET } from '@/object-record/advanced-filter/constants/DefaultAdvancedFilterDropdownOffset';
import { useApplyObjectFilterDropdownOperand } from '@/object-record/object-filter-dropdown/hooks/useApplyObjectFilterDropdownOperand';

import { getOperandLabel } from '@/object-record/object-filter-dropdown/utils/getOperandLabel';
import { RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { RecordFilterOperand } from '@/object-record/record-filter/types/RecordFilterOperand';
import { SelectControl } from '@/ui/input/components/SelectControl';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { selectedItemIdComponentState } from '@/ui/layout/selectable-list/states/selectedItemIdComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { ViewFilterOperand } from 'twenty-shared/src/types/ViewFilterOperand';
import { MenuItem } from 'twenty-ui/navigation';

type AdvancedFilterRecordFilterOperandSelectContentProps = {
  recordFilterId: string;
  filter: RecordFilter;
  operandsForFilterType: readonly RecordFilterOperand[];
};

export const AdvancedFilterRecordFilterOperandSelectContent = ({
  recordFilterId,
  filter,
  operandsForFilterType,
}: AdvancedFilterRecordFilterOperandSelectContentProps) => {
  const dropdownId = `advanced-filter-view-filter-operand-${recordFilterId}`;

  const { closeDropdown } = useCloseDropdown();

  const { applyObjectFilterDropdownOperand } =
    useApplyObjectFilterDropdownOperand();

  const handleOperandChange = (operand: ViewFilterOperand) => {
    closeDropdown(dropdownId);

    applyObjectFilterDropdownOperand(operand);
  };

  const selectedItemId = useRecoilComponentValue(
    selectedItemIdComponentState,
    dropdownId,
  );

  return (
    <Dropdown
      dropdownId={dropdownId}
      clickableComponent={
        <SelectControl
          selectedOption={{
            label: filter?.operand
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
              focusId={dropdownId}
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
      dropdownOffset={DEFAULT_ADVANCED_FILTER_DROPDOWN_OFFSET}
      dropdownPlacement="bottom-start"
    />
  );
};
