import { useEffect } from 'react';

import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { recordBoardSelectedRecordIdsComponentSelector } from '@/object-record/record-board/states/selectors/recordBoardSelectedRecordIdsComponentSelector';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';

export const RecordBoardSelectRecordsEffect = () => {
  const selectedRecordIds = useRecoilComponentValue(
    recordBoardSelectedRecordIdsComponentSelector,
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
