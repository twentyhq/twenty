import { useRecoilState } from 'recoil';

import { type MergeManySettings } from '@/object-record/hooks/useMergeManyRecords';
import { mergeSettingsState } from '@/object-record/record-merge/states/mergeSettingsState';

export const useMergeRecordsSettings = () => {
  const [mergeSettings, setMergeSettings] = useRecoilState(mergeSettingsState);

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
