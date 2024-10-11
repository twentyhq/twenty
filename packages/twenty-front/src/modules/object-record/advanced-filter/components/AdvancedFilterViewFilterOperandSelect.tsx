import { FilterDefinition } from '@/object-record/object-filter-dropdown/types/FilterDefinition';
import { getOperandLabel } from '@/object-record/object-filter-dropdown/utils/getOperandLabel';
import { getOperandsForFilterDefinition } from '@/object-record/object-filter-dropdown/utils/getOperandsForFilterType';
import { SelectControl } from '@/ui/input/components/SelectControl';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownMenu } from '@/ui/layout/dropdown/components/DropdownMenu';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { MenuItem } from '@/ui/navigation/menu-item/components/MenuItem';
import { ADVANCED_FILTER_DROPDOWN_ID } from '@/views/constants/AdvancedFilterDropdownId';
import { useUpsertCombinedViewFilters } from '@/views/hooks/useUpsertCombinedViewFilters';
import { ViewFilter } from '@/views/types/ViewFilter';
import { ViewFilterOperand } from '@/views/types/ViewFilterOperand';
import { isDefined } from 'twenty-ui';

interface AdvancedFilterViewFilterOperandSelectProps {
  viewFilter: ViewFilter;
  filterDefinition: FilterDefinition;
  isDisabled?: boolean;
}

export const AdvancedFilterViewFilterOperandSelect = (
  props: AdvancedFilterViewFilterOperandSelectProps,
) => {
  const dropdownId = `advanced-filter-view-filter-operand-${props.viewFilter.id}`;

  const { upsertCombinedViewFilter } = useUpsertCombinedViewFilters();

  const handleOperandChange = (operand: ViewFilterOperand) => {
    upsertCombinedViewFilter({
      ...props.viewFilter,
      definition: props.filterDefinition,
      operand,
    });
  };

  const operandsForFilterType = isDefined(props.filterDefinition)
    ? getOperandsForFilterDefinition(props.filterDefinition)
    : [];

  if (props.isDisabled === true) {
    return (
      <SelectControl
        selectedOption={{
          label: props.viewFilter.operand
            ? getOperandLabel(props.viewFilter.operand)
            : '',
          value: '',
        }}
        isDisabled
      />
    );
  }

  return (
    <Dropdown
      disableBlur
      dropdownId={dropdownId}
      clickableComponent={
        <SelectControl
          selectedOption={{
            label: props.viewFilter.operand
              ? getOperandLabel(props.viewFilter.operand)
              : '',
            value: '',
          }}
        />
      }
      dropdownComponents={
        <DropdownMenu width="160px">
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
        </DropdownMenu>
      }
      dropdownHotkeyScope={{ scope: ADVANCED_FILTER_DROPDOWN_ID }}
      dropdownOffset={{ y: 8, x: 0 }}
      dropdownPlacement="bottom-start"
      dropdownMenuWidth={280}
    />
  );
};
