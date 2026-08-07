import { useCallback } from 'react';

import { useRemoveRecordFilter } from '@/object-record/record-filter/hooks/useRemoveRecordFilter';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { isRecordFilterConsideredEmpty } from '@/object-record/record-filter/utils/isRecordFilterConsideredEmpty';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { EditableFilterChip } from '@/views/editable-chip/components/EditableFilterChip';
import { EditableFilterChipDropdownContent } from '@/views/editable-chip/components/EditableFilterChipDropdownContent';
import { EditableRelationFilterChip } from '@/views/editable-chip/components/EditableRelationFilterChip';
import { getEditableChipDropdownId } from '@/views/editable-chip/utils/getEditableChipDropdownId';
import { useSetEditableFilterChipDropdownStates } from '@/views/hooks/useSetEditableFilterChipDropdownStates';

type EditableFilterDropdownButtonProps = {
  recordFilter: RecordFilter;
};

export const EditableFilterDropdownButton = ({
  recordFilter,
}: EditableFilterDropdownButtonProps) => {
  const { closeDropdown } = useCloseDropdown();

  const { removeRecordFilter } = useRemoveRecordFilter();

  const handleRemove = () => {
    closeDropdown(
      getEditableChipDropdownId({ recordFilterId: recordFilter.id }),
    );

    removeRecordFilter({ recordFilterId: recordFilter.id });
  };

  const onFilterDropdownClose = useCallback(() => {
    const recordFilterIsEmpty = isRecordFilterConsideredEmpty(recordFilter);

    if (recordFilterIsEmpty) {
      removeRecordFilter({ recordFilterId: recordFilter.id });
    }
  }, [recordFilter, removeRecordFilter]);

  const { setEditableFilterChipDropdownStates } =
    useSetEditableFilterChipDropdownStates();

  const handleFilterChipClick = () => {
    setEditableFilterChipDropdownStates(recordFilter);
  };

  const dropdownId = getEditableChipDropdownId({
    recordFilterId: recordFilter.id,
  });

  const dropdownProps = {
    dropdownId,
    dropdownComponents: (
      <EditableFilterChipDropdownContent recordFilterId={recordFilter.id} />
    ),
    dropdownOffset: { y: 8, x: 0 },
    dropdownPlacement: 'bottom-start' as const,
    onClose: onFilterDropdownClose,
    onOpen: handleFilterChipClick,
  };

  if (recordFilter.type === 'RELATION') {
    return (
      <EditableRelationFilterChip
        recordFilter={recordFilter}
        onRemove={handleRemove}
        dropdown={dropdownProps}
      />
    );
  }

  return (
    <EditableFilterChip
      recordFilter={recordFilter}
      onRemove={handleRemove}
      dropdown={dropdownProps}
    />
  );
};
