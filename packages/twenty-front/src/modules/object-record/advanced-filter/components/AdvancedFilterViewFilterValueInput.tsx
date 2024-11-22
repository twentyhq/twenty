import { useCurrentViewFilter } from '@/object-record/advanced-filter/hooks/useCurrentViewFilter';
import { ObjectFilterDropdownFilterInput } from '@/object-record/object-filter-dropdown/components/ObjectFilterDropdownFilterInput';
import { useFilterDropdown } from '@/object-record/object-filter-dropdown/hooks/useFilterDropdown';
import { SelectControl } from '@/ui/input/components/SelectControl';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { ADVANCED_FILTER_DROPDOWN_ID } from '@/views/constants/AdvancedFilterDropdownId';

type AdvancedFilterViewFilterValueInputProps = {
  viewFilterId: string;
};

export const AdvancedFilterViewFilterValueInput = ({
  viewFilterId,
}: AdvancedFilterViewFilterValueInputProps) => {
  const dropdownId = `advanced-filter-view-filter-value-input-${viewFilterId}`;

  const filter = useCurrentViewFilter({ viewFilterId });

  const isDisabled = !filter?.fieldMetadataId || !filter.operand;

  const {
    setFilterDefinitionUsedInDropdown,
    setSelectedOperandInDropdown,
    setSelectedFilter,
  } = useFilterDropdown();

  if (isDisabled) {
    return (
      <SelectControl
        isDisabled
        selectedOption={{
          label: filter?.displayValue ?? '',
          value: null,
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
            label: filter?.displayValue ?? '',
            value: null,
          }}
        />
      }
      onOpen={() => {
        setFilterDefinitionUsedInDropdown(filter.definition);
        setSelectedOperandInDropdown(filter.operand);
        setSelectedFilter(filter);
      }}
      dropdownComponents={
        <DropdownMenuItemsContainer>
          <ObjectFilterDropdownFilterInput />
        </DropdownMenuItemsContainer>
      }
      dropdownHotkeyScope={{ scope: ADVANCED_FILTER_DROPDOWN_ID }}
      dropdownOffset={{ y: 8, x: 0 }}
      dropdownPlacement="bottom-start"
      dropdownMenuWidth={280}
    />
  );
};
