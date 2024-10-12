import { ObjectFilterDropdownFilterSelect } from '@/object-record/object-filter-dropdown/components/ObjectFilterDropdownFilterSelect';
import { FilterDefinition } from '@/object-record/object-filter-dropdown/types/FilterDefinition';
import { SelectControl } from '@/ui/input/components/SelectControl';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { ADVANCED_FILTER_DROPDOWN_ID } from '@/views/constants/AdvancedFilterDropdownId';
import { useUpsertCombinedViewFilters } from '@/views/hooks/useUpsertCombinedViewFilters';
import { ViewFilter } from '@/views/types/ViewFilter';

interface AdvancedFilterViewFilterFieldSelectProps {
  viewFilter: ViewFilter;
  selectedFieldLabel: string;
}

export const AdvancedFilterViewFilterFieldSelect = (
  props: AdvancedFilterViewFilterFieldSelectProps,
) => {
  const { upsertCombinedViewFilter } = useUpsertCombinedViewFilters();

  const handleSelectField = (filterDefinition: FilterDefinition) => {
    upsertCombinedViewFilter({
      ...props.viewFilter,
      fieldMetadataId: filterDefinition.fieldMetadataId,
      definition: filterDefinition,
    });
  };

  return (
    <Dropdown
      disableBlur
      dropdownId={`advanced-filter-view-filter-field-${props.viewFilter.id}`}
      clickableComponent={
        <SelectControl
          selectedOption={{
            label: props.selectedFieldLabel,
            value: '',
          }}
        />
      }
      dropdownComponents={
        <ObjectFilterDropdownFilterSelect onSelectField={handleSelectField} />
      }
      dropdownHotkeyScope={{ scope: ADVANCED_FILTER_DROPDOWN_ID }}
      dropdownOffset={{ y: 8, x: 0 }}
      dropdownPlacement="bottom-start"
    />
  );
};
