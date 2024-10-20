import { useCurrentViewFilter } from '@/object-record/advanced-filter/hooks/useCurrentViewFilter';
import { getOperandLabel } from '@/object-record/object-filter-dropdown/utils/getOperandLabel';
import { getOperandsForFilterDefinition } from '@/object-record/object-filter-dropdown/utils/getOperandsForFilterType';
import { SelectControl } from '@/ui/input/components/SelectControl';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { MenuItem } from '@/ui/navigation/menu-item/components/MenuItem';
import { ADVANCED_FILTER_DROPDOWN_ID } from '@/views/constants/AdvancedFilterDropdownId';
import { useUpsertCombinedViewFilters } from '@/views/hooks/useUpsertCombinedViewFilters';
import { ViewFilterOperand } from '@/views/types/ViewFilterOperand';
import styled from '@emotion/styled';
import { isDefined } from 'twenty-ui';

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

  const isDisabled = !filter?.fieldMetadataId;

  const { closeDropdown } = useDropdown(dropdownId);

  const { upsertCombinedViewFilter } = useUpsertCombinedViewFilters();

  const handleOperandChange = (operand: ViewFilterOperand) => {
    closeDropdown();

    if (!filter) {
      throw new Error('Filter is not defined');
    }

    upsertCombinedViewFilter({
      ...filter,
      operand,
    });
  };

  const operandsForFilterType = isDefined(filter?.definition)
    ? getOperandsForFilterDefinition(filter.definition)
    : [];

  if (isDisabled === true) {
    return (
      <SelectControl
        selectedOption={{
          label: filter?.operand
            ? getOperandLabel(filter.operand)
            : 'Select operand',
          value: '',
        }}
        isDisabled
      />
    );
  }

  return (
    <StyledContainer>
      <Dropdown
        disableBlur
        dropdownId={dropdownId}
        clickableComponent={
          <SelectControl
            selectedOption={{
              label: filter.operand
                ? getOperandLabel(filter.operand)
                : 'Select operand',
              value: '',
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
