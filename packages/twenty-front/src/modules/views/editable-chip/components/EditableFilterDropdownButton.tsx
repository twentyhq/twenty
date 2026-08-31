import { useCallback } from 'react';

import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { EditableFilterChip } from '@/views/editable-chip/components/EditableFilterChip';

import { useRemoveRecordFilter } from '@/object-record/record-filter/hooks/useRemoveRecordFilter';
import { isRecordFilterConsideredEmpty } from '@/object-record/record-filter/utils/isRecordFilterConsideredEmpty';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { EditableFilterChipDropdownContent } from '@/views/editable-chip/components/EditableFilterChipDropdownContent';
import { EditableRelationFilterChip } from '@/views/editable-chip/components/EditableRelationFilterChip';
import { getEditableChipDropdownId } from '@/views/editable-chip/utils/getEditableChipDropdownId';
import { getEditableChipObjectFilterDropdownComponentInstanceId } from '@/views/editable-chip/utils/getEditableChipObjectFilterDropdownComponentInstanceId';
import { useSetEditableFilterChipDropdownStates } from '@/views/hooks/useSetEditableFilterChipDropdownStates';

type EditableFilterDropdownButtonProps = {
  recordFilter: RecordFilter;
  dropdownIdScope?: string;
};

export const EditableFilterDropdownButton = ({
  recordFilter,
  dropdownIdScope,
}: EditableFilterDropdownButtonProps) => {
  const { closeDropdown } = useCloseDropdown();

  const { removeRecordFilter } = useRemoveRecordFilter();

  const dropdownId = getEditableChipDropdownId({
    recordFilterId: recordFilter.id,
    dropdownIdScope,
  });
  const objectFilterDropdownComponentInstanceId =
    getEditableChipObjectFilterDropdownComponentInstanceId({
      recordFilterId: recordFilter.id,
      dropdownIdScope,
    });

  const handleRemove = () => {
    closeDropdown(dropdownId);

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
    setEditableFilterChipDropdownStates(
      recordFilter,
      objectFilterDropdownComponentInstanceId,
    );
  };

  return (
    <>
      <Dropdown
        dropdownId={dropdownId}
        clickableComponent={
          recordFilter.type === 'RELATION' ? (
            <EditableRelationFilterChip
              recordFilter={recordFilter}
              onRemove={handleRemove}
              onClick={handleFilterChipClick}
            />
          ) : (
            <EditableFilterChip
              recordFilter={recordFilter}
              onRemove={handleRemove}
              onClick={handleFilterChipClick}
            />
          )
        }
        dropdownComponents={
          <EditableFilterChipDropdownContent
            recordFilterId={recordFilter.id}
            filterDropdownId={dropdownId}
          />
        }
        dropdownOffset={{ y: 8, x: 0 }}
        dropdownPlacement="bottom-start"
        onClose={onFilterDropdownClose}
      />
    </>
  );
};
