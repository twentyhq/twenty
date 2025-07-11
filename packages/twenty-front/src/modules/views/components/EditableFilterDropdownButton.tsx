import { useCallback } from 'react';

import { RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { EditableFilterChip } from '@/views/components/EditableFilterChip';

import { useRemoveRecordFilter } from '@/object-record/record-filter/hooks/useRemoveRecordFilter';
import { isRecordFilterConsideredEmpty } from '@/object-record/record-filter/utils/isRecordFilterConsideredEmpty';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { EditableFilterChipDropdownContent } from '@/views/components/EditableFilterChipDropdownContent';
import { useClearVectorSearchInput } from '@/views/hooks/useClearVectorSearchInput';
import { useSetEditableFilterChipDropdownStates } from '@/views/hooks/useSetEditableFilterChipDropdownStates';

type EditableFilterDropdownButtonProps = {
  recordFilter: RecordFilter;
};

export const EditableFilterDropdownButton = ({
  recordFilter,
}: EditableFilterDropdownButtonProps) => {
  const dropdownId = recordFilter.id;

  const { closeDropdown } = useCloseDropdown();

  const { removeRecordFilter } = useRemoveRecordFilter();

  const handleRemove = () => {
    closeDropdown(dropdownId);

    removeRecordFilter({ recordFilterId: recordFilter.id });
  };

  const { clearVectorSearchInput } = useClearVectorSearchInput();

  const onFilterDropdownClose = useCallback(() => {
    const recordFilterIsEmpty = isRecordFilterConsideredEmpty(recordFilter);

    if (recordFilterIsEmpty) {
      removeRecordFilter({ recordFilterId: recordFilter.id });
    }

    clearVectorSearchInput();
  }, [recordFilter, removeRecordFilter, clearVectorSearchInput]);

  const { setEditableFilterChipDropdownStates } =
    useSetEditableFilterChipDropdownStates();

  const handleFilterChipClick = () => {
    setEditableFilterChipDropdownStates(recordFilter);
  };

  return (
    <>
      <Dropdown
        dropdownId={recordFilter.id}
        clickableComponent={
          <EditableFilterChip
            recordFilter={recordFilter}
            onRemove={handleRemove}
            onClick={handleFilterChipClick}
          />
        }
        dropdownComponents={
          <EditableFilterChipDropdownContent recordFilterId={recordFilter.id} />
        }
        dropdownOffset={{ y: 8, x: 0 }}
        dropdownPlacement="bottom-start"
        onClose={onFilterDropdownClose}
      />
    </>
  );
};
