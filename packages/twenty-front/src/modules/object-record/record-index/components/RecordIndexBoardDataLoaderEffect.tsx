import { useEffect } from 'react';

import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { recordBoardSelectedRecordIdsComponentSelector } from '@/object-record/record-board/states/selectors/recordBoardSelectedRecordIdsComponentSelector';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';

type RecordIndexBoardDataLoaderEffectProps = {
  recordBoardId: string;
};

export const RecordIndexBoardDataLoaderEffect = ({
  recordBoardId,
}: RecordIndexBoardDataLoaderEffectProps) => {
  const selectedRecordIds = useRecoilComponentValue(
    recordBoardSelectedRecordIdsComponentSelector,
    recordBoardId,
  );

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
