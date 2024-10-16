import { ConfigurableFilterDropdownContent } from '@/object-record/object-filter-dropdown/components/ConfigurableFilterDropdownContent';
import { useFilterDropdown } from '@/object-record/object-filter-dropdown/hooks/useFilterDropdown';
import { FilterDefinition } from '@/object-record/object-filter-dropdown/types/FilterDefinition';
import { SelectControl } from '@/ui/input/components/SelectControl';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { ADVANCED_FILTER_DROPDOWN_ID } from '@/views/constants/AdvancedFilterDropdownId';
import { ViewFilter } from '@/views/types/ViewFilter';

interface AdvancedFilterViewFilterValueInputProps {
  viewFilter: ViewFilter;
  filterDefinition: FilterDefinition;
  isDisabled?: boolean;
}

export const AdvancedFilterViewFilterValueInput = (
  props: AdvancedFilterViewFilterValueInputProps,
) => {
  const dropdownId = `advanced-filter-view-filter-value-input-${props.viewFilter.id}`;

  const { setFilterDefinitionUsedInDropdown, setSelectedOperandInDropdown } =
    useFilterDropdown();

  if (props.isDisabled === true) {
    return (
      <SelectControl
        isDisabled
        selectedOption={{
          label: props.viewFilter?.displayValue ?? '',
          value: '',
        }}
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
            label: props.viewFilter?.displayValue ?? '',
            value: '',
          }}
        />
      }
      onOpen={() => {
        setFilterDefinitionUsedInDropdown(props.filterDefinition);
        setSelectedOperandInDropdown(props.viewFilter.operand);
      }}
      dropdownComponents={
        <DropdownMenuItemsContainer>
          <ConfigurableFilterDropdownContent
            filterDefinitionUsedInDropdown={props.filterDefinition}
          />
        </DropdownMenuItemsContainer>
      }
      dropdownHotkeyScope={{ scope: ADVANCED_FILTER_DROPDOWN_ID }}
      dropdownOffset={{ y: 8, x: 0 }}
      dropdownPlacement="bottom-start"
      dropdownMenuWidth={280}
    />
  );
};
