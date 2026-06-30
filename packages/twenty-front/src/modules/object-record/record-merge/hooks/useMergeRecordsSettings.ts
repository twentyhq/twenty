import { type MergeManySettings } from '@/object-record/hooks/useMergeManyRecords';
import { mergeSettingsState } from '@/object-record/record-merge/states/mergeSettingsState';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';

export const useMergeRecordsSettings = () => {
  const [mergeSettings, setMergeSettings] = useAtomState(mergeSettingsState);

  const updateMergeSettings = (settings: MergeManySettings) => {
    setMergeSettings(settings);
  };

  const updatePriorityRecordIndex = (conflictPriorityIndex: number) => {
    setMergeSettings({
      ...mergeSettings,
      conflictPriorityIndex,
    });
  };

  return {
    mergeSettings,
    updateMergeSettings,
    updatePriorityRecordIndex,
  };
};
