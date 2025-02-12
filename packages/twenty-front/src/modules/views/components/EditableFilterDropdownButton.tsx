import { useCallback } from 'react';

import { RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { HotkeyScope } from '@/ui/utilities/hotkey/types/HotkeyScope';
import { EditableFilterChip } from '@/views/components/EditableFilterChip';

import { ObjectFilterOperandSelectAndInput } from '@/object-record/object-filter-dropdown/components/ObjectFilterOperandSelectAndInput';
import { useRemoveRecordFilter } from '@/object-record/record-filter/hooks/useRemoveRecordFilter';
import { RecordFilterOperand } from '@/object-record/record-filter/types/RecordFilterOperand';
import { EditableFilterDropdownButtonEffect } from '@/views/components/EditableFilterDropdownButtonEffect';
import { useDeleteCombinedViewFilters } from '@/views/hooks/useDeleteCombinedViewFilters';

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
  const { closeDropdown } = useDropdown(viewFilterDropdownId);

  const { deleteCombinedViewFilter } = useDeleteCombinedViewFilters();

  const { removeRecordFilter } = useRemoveRecordFilter();

  const handleRemove = () => {
    closeDropdown();

    deleteCombinedViewFilter(viewFilter.id);
    removeRecordFilter(viewFilter.fieldMetadataId);
  };

  const handleDropdownClickOutside = useCallback(() => {
    const { id: fieldId, value, operand, fieldMetadataId } = viewFilter;
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
      removeRecordFilter(fieldMetadataId);
      deleteCombinedViewFilter(fieldId);
    }
  }, [viewFilter, deleteCombinedViewFilter, removeRecordFilter]);

  return (
    <>
      <EditableFilterDropdownButtonEffect
        viewFilterDropdownId={viewFilterDropdownId}
        viewFilter={viewFilter}
      />
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
    </>
  );
};
