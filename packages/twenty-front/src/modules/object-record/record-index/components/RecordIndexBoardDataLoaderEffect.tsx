import { useEffect } from 'react';
import { useRecoilValue } from 'recoil';

import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { isRecordBoardCompactModeActiveComponentState } from '@/object-record/record-board/states/isRecordBoardCompactModeActiveComponentState';
import { recordBoardFieldDefinitionsComponentState } from '@/object-record/record-board/states/recordBoardFieldDefinitionsComponentState';
import { recordBoardSelectedRecordIdsComponentSelector } from '@/object-record/record-board/states/selectors/recordBoardSelectedRecordIdsComponentSelector';
import { recordIndexFieldDefinitionsState } from '@/object-record/record-index/states/recordIndexFieldDefinitionsState';
import { recordIndexIsCompactModeActiveState } from '@/object-record/record-index/states/recordIndexIsCompactModeActiveState';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentStateV2';

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

  const setRecordBoardFieldDefinitions = useSetRecoilComponentStateV2(
    recordBoardFieldDefinitionsComponentState,
    recordBoardId,
  );

  const selectedRecordIds = useRecoilComponentValueV2(
    recordBoardSelectedRecordIdsComponentSelector,
    recordBoardId,
  );

  const setIsCompactModeActive = useSetRecoilComponentStateV2(
    isRecordBoardCompactModeActiveComponentState,
    recordBoardId,
  );

  useEffect(() => {
    setIsCompactModeActive(recordIndexIsCompactModeActive);
  }, [recordIndexIsCompactModeActive, setIsCompactModeActive]);

  useEffect(() => {
    setRecordBoardFieldDefinitions(recordIndexFieldDefinitions);
  }, [recordIndexFieldDefinitions, setRecordBoardFieldDefinitions]);

  const setContextStoreTargetedRecords = useSetRecoilComponentStateV2(
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
