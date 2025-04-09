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

type EditableFilterDropdownButtonProps = {
  recordFilter: RecordFilter;
  hotkeyScope: HotkeyScope;
};

export const EditableFilterDropdownButton = ({
  recordFilter,
  hotkeyScope,
}: EditableFilterDropdownButtonProps) => {
  const { closeDropdown } = useDropdown(recordFilter.id);

  const { removeRecordFilter } = useRemoveRecordFilter();

  const handleRemove = () => {
    closeDropdown();

    removeRecordFilter({ recordFilterId: recordFilter.id });
  };

  const handleDropdownClickOutside = useCallback(() => {
    const { value, operand } = recordFilter;
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
      removeRecordFilter({ recordFilterId: recordFilter.id });
    }
  }, [recordFilter, removeRecordFilter]);

  return (
    <>
      <EditableFilterDropdownButtonEffect recordFilter={recordFilter} />
      <Dropdown
        dropdownId={recordFilter.id}
        clickableComponent={
          <EditableFilterChip
            viewFilter={recordFilter}
            onRemove={handleRemove}
          />
        }
        dropdownComponents={
          <ObjectFilterOperandSelectAndInput
            filterDropdownId={recordFilter.id}
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
