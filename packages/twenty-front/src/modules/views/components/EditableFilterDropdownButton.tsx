import { useCallback, useEffect } from 'react';

import { RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { HotkeyScope } from '@/ui/utilities/hotkey/types/HotkeyScope';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { EditableFilterChip } from '@/views/components/EditableFilterChip';

import { ObjectFilterOperandSelectAndInput } from '@/object-record/object-filter-dropdown/components/ObjectFilterOperandSelectAndInput';
import { filterDefinitionUsedInDropdownComponentState } from '@/object-record/object-filter-dropdown/states/filterDefinitionUsedInDropdownComponentState';
import { selectedFilterComponentState } from '@/object-record/object-filter-dropdown/states/selectedFilterComponentState';
import { selectedOperandInDropdownComponentState } from '@/object-record/object-filter-dropdown/states/selectedOperandInDropdownComponentState';
import { RecordFilterOperand } from '@/object-record/record-filter/types/RecordFilterOperand';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentStateV2';
import { useDeleteCombinedViewFilters } from '@/views/hooks/useDeleteCombinedViewFilters';
import { availableFilterDefinitionsComponentState } from '@/views/states/availableFilterDefinitionsComponentState';
import { isDefined } from '~/utils/isDefined';

type EditableFilterDropdownButtonProps = {
  viewFilterDropdownId: string;
  viewFilter: RecordFilter;
  hotkeyScope: HotkeyScope;
};

export const EditableFilterDropdownButton = ({
  viewFilterDropdownId,
  viewFilter,
  hotkeyScope,
}: EditableFilterDropdownButtonProps) => {
  const setFilterDefinitionUsedInDropdown = useSetRecoilComponentStateV2(
    filterDefinitionUsedInDropdownComponentState,
    viewFilterDropdownId,
  );

  const setSelectedOperandInDropdown = useSetRecoilComponentStateV2(
    selectedOperandInDropdownComponentState,
    viewFilterDropdownId,
  );

  const setSelectedFilter = useSetRecoilComponentStateV2(
    selectedFilterComponentState,
    viewFilterDropdownId,
  );

  // TODO: verify this instance id works
  const availableFilterDefinitions = useRecoilComponentValueV2(
    availableFilterDefinitionsComponentState,
    viewFilterDropdownId,
  );

  const { closeDropdown } = useDropdown(viewFilterDropdownId);

  const { deleteCombinedViewFilter } = useDeleteCombinedViewFilters();

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

    deleteCombinedViewFilter(viewFilter.id);
  };

  const handleDropdownClickOutside = useCallback(() => {
    const { id: fieldId, value, operand } = viewFilter;
    if (
      !value &&
      ![
        RecordFilterOperand.IsEmpty,
        RecordFilterOperand.IsNotEmpty,
        RecordFilterOperand.IsInPast,
        RecordFilterOperand.IsInFuture,
        RecordFilterOperand.IsToday,
      ].includes(operand)
    ) {
      deleteCombinedViewFilter(fieldId);
    }
  }, [viewFilter, deleteCombinedViewFilter]);

  return (
    <Dropdown
      dropdownId={viewFilterDropdownId}
      clickableComponent={
        <EditableFilterChip viewFilter={viewFilter} onRemove={handleRemove} />
      }
      dropdownComponents={
        <ObjectFilterOperandSelectAndInput
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
