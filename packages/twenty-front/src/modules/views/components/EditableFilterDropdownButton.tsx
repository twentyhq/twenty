import { useCallback, useEffect } from 'react';
import { useRecoilValue } from 'recoil';

import { MultipleFiltersDropdownContent } from '@/object-record/object-filter-dropdown/components/MultipleFiltersDropdownContent';
import { useFilterDropdown } from '@/object-record/object-filter-dropdown/hooks/useFilterDropdown';
import { Filter } from '@/object-record/object-filter-dropdown/types/Filter';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { HotkeyScope } from '@/ui/utilities/hotkey/types/HotkeyScope';
import { EditableFilterChip } from '@/views/components/EditableFilterChip';
import { useCombinedViewFilters } from '@/views/hooks/useCombinedViewFilters';
import { isDefined } from '~/utils/isDefined';

type EditableFilterDropdownButtonProps = {
  viewFilterDropdownId: string;
  viewFilter: Filter;
  hotkeyScope: HotkeyScope;
};

export const EditableFilterDropdownButton = ({
  viewFilterDropdownId,
  viewFilter,
  hotkeyScope,
}: EditableFilterDropdownButtonProps) => {
  const {
    availableFilterDefinitionsState,
    setFilterDefinitionUsedInDropdown,
    setSelectedOperandInDropdown,
    setSelectedFilter,
  } = useFilterDropdown({
    filterDropdownId: viewFilterDropdownId,
  });

  const availableFilterDefinitions = useRecoilValue(
    availableFilterDefinitionsState,
  );

  const { closeDropdown } = useDropdown(viewFilterDropdownId);

  const { removeCombinedViewFilter } = useCombinedViewFilters();

  useEffect(() => {
    const filterDefinition = availableFilterDefinitions.find(
      (filterDefinition) =>
        filterDefinition.fieldMetadataId === viewFilter.fieldMetadataId,
    );

    if (isDefined(filterDefinition)) {
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

    removeCombinedViewFilter(viewFilter.fieldMetadataId);
  };

  const handleDropdownClickOutside = useCallback(() => {
    const { value, fieldMetadataId } = viewFilter;
    if (!value) {
      removeCombinedViewFilter(fieldMetadataId);
    }
  }, [viewFilter, removeCombinedViewFilter]);

  return (
    <Dropdown
      dropdownId={viewFilterDropdownId}
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
