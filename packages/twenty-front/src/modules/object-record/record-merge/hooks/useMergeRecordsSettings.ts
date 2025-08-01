import { useRecoilState } from 'recoil';

import { useFindManyRecordsSelectedInContextStore } from '@/context-store/hooks/useFindManyRecordsSelectedInContextStore';
import { MergeManySettings } from '@/object-record/hooks/useMergeManyRecords';
import { mergeSettingsState } from '../states/mergeSettingsState';

export const useMergeRecordsSettings = () => {
  const [mergeSettings, setMergeSettings] = useRecoilState(mergeSettingsState);
  const { records: selectedRecords } = useFindManyRecordsSelectedInContextStore(
    {
      limit: 10,
    },
  );

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
    mergeSettings,
    updateMergeSettings,
    updatePriorityRecordIndex,
  };
};
