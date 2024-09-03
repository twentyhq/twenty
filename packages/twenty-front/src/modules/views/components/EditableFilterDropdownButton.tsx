import { useCallback, useEffect } from 'react';

import { MultipleFiltersDropdownContent } from '@/object-record/object-filter-dropdown/components/MultipleFiltersDropdownContent';
import { useFilterDropdown } from '@/object-record/object-filter-dropdown/hooks/useFilterDropdown';
import { Filter } from '@/object-record/object-filter-dropdown/types/Filter';
import { FilterOperand } from '@/object-record/object-filter-dropdown/types/FilterOperand';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { HotkeyScope } from '@/ui/utilities/hotkey/types/HotkeyScope';
import { useRecoilInstanceValue } from '@/ui/utilities/state/instance/hooks/useRecoilInstanceValue';
import { EditableFilterChip } from '@/views/components/EditableFilterChip';
import { useCombinedViewFilters } from '@/views/hooks/useCombinedViewFilters';
import { availableFilterDefinitionsInstanceState } from '@/views/states/availableFilterDefinitionsInstanceState';
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
    setFilterDefinitionUsedInDropdown,
    setSelectedOperandInDropdown,
    setSelectedFilter,
  } = useFilterDropdown({
    filterDropdownId: viewFilterDropdownId,
  });

  // TODO: verify this instance id works
  const availableFilterDefinitions = useRecoilInstanceValue(
    availableFilterDefinitionsInstanceState,
    viewFilterDropdownId,
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

    removeCombinedViewFilter(viewFilter.id);
  };

  const handleDropdownClickOutside = useCallback(() => {
    const { id: fieldId, value, operand } = viewFilter;
    if (
      !value &&
      ![FilterOperand.IsEmpty, FilterOperand.IsNotEmpty].includes(operand)
    ) {
      removeCombinedViewFilter(fieldId);
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
