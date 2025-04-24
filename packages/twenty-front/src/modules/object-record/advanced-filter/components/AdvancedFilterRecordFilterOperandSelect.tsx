import { useGetFieldMetadataItemById } from '@/object-metadata/hooks/useGetFieldMetadataItemById';
import { getFilterTypeFromFieldType } from '@/object-metadata/utils/formatFieldMetadataItemsAsFilterDefinitions';
import { DEFAULT_ADVANCED_FILTER_DROPDOWN_OFFSET } from '@/object-record/advanced-filter/constants/DefaultAdvancedFilterDropdownOffset';

import { getInitialFilterValue } from '@/object-record/object-filter-dropdown/utils/getInitialFilterValue';
import { getOperandLabel } from '@/object-record/object-filter-dropdown/utils/getOperandLabel';
import { useUpsertRecordFilter } from '@/object-record/record-filter/hooks/useUpsertRecordFilter';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { getRecordFilterOperands } from '@/object-record/record-filter/utils/getRecordFilterOperands';
import { SelectControl } from '@/ui/input/components/SelectControl';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableItem';
import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';
import { selectedItemIdComponentState } from '@/ui/layout/selectable-list/states/selectedItemIdComponentState';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { ViewFilterOperand } from '@/views/types/ViewFilterOperand';
import styled from '@emotion/styled';
import { isDefined } from 'twenty-shared/utils';
import { MenuItem } from 'twenty-ui/navigation';

const StyledContainer = styled.div`
  width: 100px;
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

  const filter = currentRecordFilters.find(
    (recordFilter) => recordFilter.id === recordFilterId,
  );

  const { getFieldMetadataItemById } = useGetFieldMetadataItemById();

  const isDisabled = !filter?.fieldMetadataId;

  const { closeDropdown } = useDropdown(dropdownId);

  const { upsertRecordFilter } = useUpsertRecordFilter();

  const handleOperandChange = (operand: ViewFilterOperand) => {
    closeDropdown();

    if (!filter) {
      throw new Error('Filter is not defined');
    }

    const fieldMetadataItem = getFieldMetadataItemById(filter.fieldMetadataId);

    if (!isDefined(fieldMetadataItem)) {
      throw new Error('Field metadata item is not defined');
    }

    const filterType = getFilterTypeFromFieldType(fieldMetadataItem.type);

    const { value, displayValue } = getInitialFilterValue(
      filterType,
      operand,
      filter.value,
      filter.displayValue,
    );

    upsertRecordFilter({
      ...filter,
      operand,
      value,
      displayValue,
    });
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
    <StyledContainer>
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
          <DropdownMenuItemsContainer>
            <SelectableList
              hotkeyScope={dropdownId}
              selectableItemIdArray={operandsForFilterType}
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
        }
        dropdownHotkeyScope={{ scope: dropdownId }}
        dropdownOffset={DEFAULT_ADVANCED_FILTER_DROPDOWN_OFFSET}
        dropdownPlacement="bottom-start"
      />
    </StyledContainer>
  );
};
