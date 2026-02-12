import { type MergeManySettings } from '@/object-record/hooks/useMergeManyRecords';
import { mergeSettingsState } from '@/object-record/record-merge/states/mergeSettingsState';
import { useRecoilStateV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilStateV2';

export const useMergeRecordsSettings = () => {
  const [mergeSettings, setMergeSettings] =
    useRecoilStateV2(mergeSettingsState);

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
