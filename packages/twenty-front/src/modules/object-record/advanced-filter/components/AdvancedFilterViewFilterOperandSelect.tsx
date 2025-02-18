import { useGetFieldMetadataItemById } from '@/object-metadata/hooks/useGetFieldMetadataItemById';
import { getFilterTypeFromFieldType } from '@/object-metadata/utils/formatFieldMetadataItemsAsFilterDefinitions';
import { useCurrentViewFilter } from '@/object-record/advanced-filter/hooks/useCurrentViewFilter';
import { getInitialFilterValue } from '@/object-record/object-filter-dropdown/utils/getInitialFilterValue';
import { getOperandLabel } from '@/object-record/object-filter-dropdown/utils/getOperandLabel';
import { getRecordFilterOperands } from '@/object-record/record-filter/utils/getRecordFilterOperands';
import { SelectControl } from '@/ui/input/components/SelectControl';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { ADVANCED_FILTER_DROPDOWN_ID } from '@/views/constants/AdvancedFilterDropdownId';
import { useUpsertCombinedViewFilters } from '@/views/hooks/useUpsertCombinedViewFilters';
import { ViewFilterOperand } from '@/views/types/ViewFilterOperand';
import styled from '@emotion/styled';
import { isDefined } from 'twenty-shared';
import { MenuItem } from 'twenty-ui';

const StyledContainer = styled.div`
  flex: 1;
`;

type AdvancedFilterViewFilterOperandSelectProps = {
  viewFilterId: string;
};

export const AdvancedFilterViewFilterOperandSelect = ({
  viewFilterId,
}: AdvancedFilterViewFilterOperandSelectProps) => {
  const dropdownId = `advanced-filter-view-filter-operand-${viewFilterId}`;

  const filter = useCurrentViewFilter({ viewFilterId });

  const { getFieldMetadataItemById } = useGetFieldMetadataItemById();

  const isDisabled = !filter?.fieldMetadataId;

  const { closeDropdown } = useDropdown(dropdownId);

  const { upsertCombinedViewFilter } = useUpsertCombinedViewFilters();

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

    upsertCombinedViewFilter({
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
      })
    : [];

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
            {operandsForFilterType.map((filterOperand, index) => (
              <MenuItem
                key={`select-filter-operand-${index}`}
                onClick={() => {
                  handleOperandChange(filterOperand);
                }}
                text={getOperandLabel(filterOperand)}
              />
            ))}
          </DropdownMenuItemsContainer>
        }
        dropdownHotkeyScope={{ scope: ADVANCED_FILTER_DROPDOWN_ID }}
        dropdownOffset={{ y: 8, x: 0 }}
        dropdownPlacement="bottom-start"
      />
    </StyledContainer>
  );
};
