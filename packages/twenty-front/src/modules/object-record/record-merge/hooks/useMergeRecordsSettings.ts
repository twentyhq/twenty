import { useRecoilState, useRecoilValue } from 'recoil';

import { commandMenuNavigationRecordsState } from '@/command-menu/states/commandMenuNavigationRecordsState';
import { type MergeManySettings } from '@/object-record/hooks/useMergeManyRecords';
import { mergeSettingsState } from '../states/mergeSettingsState';

export const useMergeRecordsSettings = () => {
  const [mergeSettings, setMergeSettings] = useRecoilState(mergeSettingsState);
  const commandMenuNavigationRecords = useRecoilValue(
    commandMenuNavigationRecordsState,
  );
  const selectedRecords = commandMenuNavigationRecords.map(
    (record) => record.record,
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
