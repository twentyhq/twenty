import { useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';

import { lastShowPageRecordIdState } from '@/object-record/record-field/states/lastShowPageRecordId';
import { useCurrentRecordGroupId } from '@/object-record/record-group/hooks/useCurrentRecordGroupId';
import { useLazyLoadRecordIndexTable } from '@/object-record/record-index/hooks/useLazyLoadRecordIndexTable';
import { recordIndexHasFetchedAllRecordsByGroupComponentState } from '@/object-record/record-index/states/recordIndexHasFetchedAllRecordsByGroupComponentState';
import { ROW_HEIGHT } from '@/object-record/record-table/constants/RowHeight';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { useRecordTable } from '@/object-record/record-table/hooks/useRecordTable';
import { isRecordTableInitialLoadingComponentState } from '@/object-record/record-table/states/isRecordTableInitialLoadingComponentState';
import { useScrollToPosition } from '@/ui/utilities/scroll/hooks/useScrollToPosition';
import { useSetRecoilComponentFamilyStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentFamilyStateV2';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentStateV2';
import { isNonEmptyString } from '@sniptt/guards';

export const RecordTableRecordGroupBodyEffect = () => {
  const { objectNameSingular } = useRecordTableContextOrThrow();

  const [hasInitialized, setHasInitialized] = useState(false);

  const { setRecordTableData } = useRecordTable();

  const setIsRecordTableInitialLoading = useSetRecoilComponentStateV2(
    isRecordTableInitialLoadingComponentState,
  );

  const recordGroupId = useCurrentRecordGroupId();

  const { findManyRecordsLazy } =
    useLazyLoadRecordIndexTable(objectNameSingular);

  const setHasRecordFetchedAllRecordsComponents =
    useSetRecoilComponentFamilyStateV2(
      recordIndexHasFetchedAllRecordsByGroupComponentState,
      recordGroupId,
    );

  const [lastShowPageRecordId] = useRecoilState(lastShowPageRecordIdState);

  const { scrollToPosition } = useScrollToPosition();

  useEffect(() => {
    const fetchRecords = async () => {
      const { records, totalCount, hasNextPage } = await findManyRecordsLazy();
      setHasRecordFetchedAllRecordsComponents(hasNextPage);
      setRecordTableData({
        records,
        currentRecordGroupId: recordGroupId,
        totalCount,
      });
      if (isNonEmptyString(lastShowPageRecordId)) {
        const recordPosition = records.findIndex(
          (record) => record.id === lastShowPageRecordId,
        );

        if (recordPosition !== -1) {
          const positionInPx = recordPosition * ROW_HEIGHT;

          scrollToPosition(positionInPx);
        }
      }
      setHasInitialized(true);
      setIsRecordTableInitialLoading(false);
    };

    fetchRecords();
  }, [
    findManyRecordsLazy,
    hasInitialized,
    recordGroupId,
    lastShowPageRecordId,
    scrollToPosition,
  ]);

  return <></>;
};
