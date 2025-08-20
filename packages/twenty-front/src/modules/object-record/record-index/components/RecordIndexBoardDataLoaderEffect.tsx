import { useEffect } from 'react';
import { useRecoilValue } from 'recoil';

import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { isRecordBoardCompactModeActiveComponentState } from '@/object-record/record-board/states/isRecordBoardCompactModeActiveComponentState';
import { recordBoardFieldDefinitionsComponentState } from '@/object-record/record-board/states/recordBoardFieldDefinitionsComponentState';
import { recordBoardSelectedRecordIdsComponentSelector } from '@/object-record/record-board/states/selectors/recordBoardSelectedRecordIdsComponentSelector';
import { recordIndexFieldDefinitionsState } from '@/object-record/record-index/states/recordIndexFieldDefinitionsState';
import { recordIndexIsCompactModeActiveState } from '@/object-record/record-index/states/recordIndexIsCompactModeActiveState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';

type RecordIndexBoardDataLoaderEffectProps = {
  recordBoardId: string;
};

export const RecordIndexBoardDataLoaderEffect = ({
  recordBoardId,
}: RecordIndexBoardDataLoaderEffectProps) => {
  const recordIndexFieldDefinitions = useRecoilValue(
    recordIndexFieldDefinitionsState,
  );

  const recordIndexIsCompactModeActive = useRecoilValue(
    recordIndexIsCompactModeActiveState,
  );

  const setRecordBoardFieldDefinitions = useSetRecoilComponentState(
    recordBoardFieldDefinitionsComponentState,
    recordBoardId,
  );

  const selectedRecordIds = useRecoilComponentValue(
    recordBoardSelectedRecordIdsComponentSelector,
    recordBoardId,
  );

  const setIsCompactModeActive = useSetRecoilComponentState(
    isRecordBoardCompactModeActiveComponentState,
    recordBoardId,
  );

  useEffect(() => {
    setIsCompactModeActive(recordIndexIsCompactModeActive);
  }, [recordIndexIsCompactModeActive, setIsCompactModeActive]);

  useEffect(() => {
    setRecordBoardFieldDefinitions(recordIndexFieldDefinitions);
  }, [recordIndexFieldDefinitions, setRecordBoardFieldDefinitions]);

  const setContextStoreTargetedRecords = useSetRecoilComponentState(
    contextStoreTargetedRecordsRuleComponentState,
  );

  useEffect(() => {
    setContextStoreTargetedRecords({
      mode: 'selection',
      selectedRecordIds: selectedRecordIds,
    });

    return () => {
      setContextStoreTargetedRecords({
        mode: 'selection',
        selectedRecordIds: [],
      });
    };
  }, [selectedRecordIds, setContextStoreTargetedRecords]);

  return <></>;
};
