import { useRecoilState } from 'recoil';

import { type MergeManySettings } from '@/object-record/hooks/useMergeManyRecords';
import { mergeRecordsState } from '../states/mergeRecordsState';
import { mergeSettingsState } from '../states/mergeSettingsState';

export const useMergeRecordsSettings = () => {
  const [mergeSettings, setMergeSettings] = useRecoilState(mergeSettingsState);
  const [selectedRecords, setSelectedRecords] = useRecoilState(mergeRecordsState);

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
    selectedRecords,
    setSelectedRecords,
    mergeSettings,
    updateMergeSettings,
    updatePriorityRecordIndex,
  };
};
