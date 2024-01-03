import { useCallback, useEffect } from 'react';

import { MultipleFiltersDropdownContent } from '@/object-record/object-filter-dropdown/components/MultipleFiltersDropdownContent';
import { useFilterDropdown } from '@/object-record/object-filter-dropdown/hooks/useFilterDropdown';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { HotkeyScope } from '@/ui/utilities/hotkey/types/HotkeyScope';
import { EditableFilterChip } from '@/views/components/EditableFilterChip';
import { useViewBar } from '@/views/hooks/useViewBar';
import { ViewFilter } from '@/views/types/ViewFilter';

type EditableFilterDropdownButtonProps = {
  viewFilterDropdownId: string;
  viewFilter: ViewFilter;
  hotkeyScope: HotkeyScope;
};

export const EditableFilterDropdownButton = ({
  viewFilterDropdownId,
  viewFilter,
  hotkeyScope,
}: EditableFilterDropdownButtonProps) => {
  const {
    availableFilterDefinitions,
    setFilterDefinitionUsedInDropdown,
    setSelectedOperandInDropdown,
    setSelectedFilter,
  } = useFilterDropdown({
    filterDropdownId: viewFilterDropdownId,
  });

  const { closeDropdown } = useDropdown(viewFilterDropdownId);

  const { removeViewFilter } = useViewBar();

  useEffect(() => {
    const filterDefinition = availableFilterDefinitions.find(
      (filterDefinition) =>
        filterDefinition.fieldMetadataId === viewFilter.fieldMetadataId,
    );

    if (filterDefinition) {
      setFilterDefinitionUsedInDropdown(filterDefinition);
      setSelectedOperandInDropdown(viewFilter.operand);
      setSelectedFilter(viewFilter);
    }
  }, [
    availableFilterDefinitions,
    setFilterDefinitionUsedInDropdown,
    viewFilter,
    setSelectedOperandInDropdown,
    setSelectedFilter,
    viewFilterDropdownId,
  ]);

  const handleRemove = () => {
    closeDropdown();

    removeViewFilter(viewFilter.fieldMetadataId);
  };

  const handleDropdownClickOutside = useCallback(() => {
    const { value, fieldMetadataId } = viewFilter;
    if (!value) {
      removeViewFilter(fieldMetadataId);
    }
  }, [viewFilter, removeViewFilter]);

  return (
    <Dropdown
      clickableComponent={
        <EditableFilterChip viewFilter={viewFilter} onRemove={handleRemove} />
      }
      dropdownComponents={
        <MultipleFiltersDropdownContent
          filterDropdownId={viewFilterDropdownId}
        />
      }
      dropdownHotkeyScope={hotkeyScope}
      dropdownOffset={{ y: 8, x: 0 }}
      dropdownPlacement="bottom-start"
      onClickOutside={handleDropdownClickOutside}
    />
  );
};
