import { MergePrioritySettings } from '@/object-record/record-merge/components/MergePrioritySettings';
import { useMergeRecordsSelectedRecords } from '@/object-record/record-merge/hooks/useMergeRecordsSelectedRecords';
import { useMergeRecordsSettings } from '@/object-record/record-merge/hooks/useMergeRecordsSettings';

export const MergeSettingsTab = () => {
  const { mergeSettings, updatePriorityRecordIndex } =
    useMergeRecordsSettings();
  const { selectedRecords } = useMergeRecordsSelectedRecords();

  return (
    <MergePrioritySettings
      selectedRecordCount={selectedRecords.length}
      priorityRecordIndex={mergeSettings.conflictPriorityIndex}
      onPriorityRecordIndexChange={updatePriorityRecordIndex}
      dropdownId="merge-settings-priority-select"
    />
  );
};
