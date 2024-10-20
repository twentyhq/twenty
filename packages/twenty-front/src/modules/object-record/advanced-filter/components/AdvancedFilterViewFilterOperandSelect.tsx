import { FilterDefinition } from '@/object-record/object-filter-dropdown/types/FilterDefinition';
import { getOperandLabel } from '@/object-record/object-filter-dropdown/utils/getOperandLabel';
import { getOperandsForFilterDefinition } from '@/object-record/object-filter-dropdown/utils/getOperandsForFilterType';
import { SelectControl } from '@/ui/input/components/SelectControl';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { MenuItem } from '@/ui/navigation/menu-item/components/MenuItem';
import { ADVANCED_FILTER_DROPDOWN_ID } from '@/views/constants/AdvancedFilterDropdownId';
import { useUpsertCombinedViewFilters } from '@/views/hooks/useUpsertCombinedViewFilters';
import { ViewFilter } from '@/views/types/ViewFilter';
import { ViewFilterOperand } from '@/views/types/ViewFilterOperand';
import styled from '@emotion/styled';
import { isDefined } from 'twenty-ui';

const StyledContainer = styled.div`
  flex: 1;
`;

type AdvancedFilterViewFilterOperandSelectProps = {
  viewFilter: ViewFilter;
  filterDefinition: FilterDefinition;
  isDisabled?: boolean;
};

export const AdvancedFilterViewFilterOperandSelect = ({
  viewFilter,
  filterDefinition,
  isDisabled,
}: AdvancedFilterViewFilterOperandSelectProps) => {
  const dropdownId = `advanced-filter-view-filter-operand-${viewFilter.id}`;

  const { closeDropdown } = useDropdown(dropdownId);

  const { upsertCombinedViewFilter } = useUpsertCombinedViewFilters();

  const handleOperandChange = (operand: ViewFilterOperand) => {
    closeDropdown();

    upsertCombinedViewFilter({
      ...viewFilter,
      definition: filterDefinition,
      operand,
    });
  };

  const operandsForFilterType = isDefined(filterDefinition)
    ? getOperandsForFilterDefinition(filterDefinition)
    : [];

  if (isDisabled === true) {
    return (
      <SelectControl
        selectedOption={{
          label: viewFilter.operand
            ? getOperandLabel(viewFilter.operand)
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
              label: viewFilter.operand
                ? getOperandLabel(viewFilter.operand)
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
