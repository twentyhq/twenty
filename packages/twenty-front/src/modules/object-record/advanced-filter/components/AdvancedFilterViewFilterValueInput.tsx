import { ConfigurableFilterDropdownContent } from '@/object-record/object-filter-dropdown/components/ConfigurableFilterDropdownContent';
import { FilterDefinition } from '@/object-record/object-filter-dropdown/types/FilterDefinition';
import { SelectControl } from '@/ui/input/components/SelectControl';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownMenu } from '@/ui/layout/dropdown/components/DropdownMenu';
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
      dropdownComponents={
        <DropdownMenu width="160px">
          <DropdownMenuItemsContainer>
            <ConfigurableFilterDropdownContent
              filterDefinitionUsedInDropdown={props.filterDefinition}
            />
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
