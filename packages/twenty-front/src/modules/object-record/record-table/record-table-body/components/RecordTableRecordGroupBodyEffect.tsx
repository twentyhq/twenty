import { useEffect } from 'react';

import { lastShowPageRecordIdState } from '@/object-record/record-field/ui/states/lastShowPageRecordId';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useCurrentRecordGroupId } from '@/object-record/record-group/hooks/useCurrentRecordGroupId';
import { useRecordIndexTableQuery } from '@/object-record/record-index/hooks/useRecordIndexTableQuery';
import { recordIndexHasFetchedAllRecordsByGroupComponentState } from '@/object-record/record-index/states/recordIndexHasFetchedAllRecordsByGroupComponentState';

import { RECORD_TABLE_ROW_HEIGHT } from '@/object-record/record-table/constants/RecordTableRowHeight';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { useSetRecordTableData } from '@/object-record/record-table/hooks/internal/useSetRecordTableData';
import { isRecordTableInitialLoadingComponentState } from '@/object-record/record-table/states/isRecordTableInitialLoadingComponentState';
import { useScrollToPosition } from '@/ui/utilities/scroll/hooks/useScrollToPosition';
import { useSetAtomComponentFamilyState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentFamilyState';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { isNonEmptyString } from '@sniptt/guards';

export const RecordTableRecordGroupBodyEffect = () => {
  const { objectNameSingular } = useRecordTableContextOrThrow();
  const { recordTableId } = useRecordTableContextOrThrow();

  const setRecordTableData = useSetRecordTableData({
    recordTableId,
  });

  const setIsRecordTableInitialLoading = useSetAtomComponentState(
    isRecordTableInitialLoadingComponentState,
  );

  const recordGroupId = useCurrentRecordGroupId();

  const { records, loading, hasNextPage } =
    useRecordIndexTableQuery(objectNameSingular);

  const setRecordIndexHasFetchedAllRecordsByGroup =
    useSetAtomComponentFamilyState(
      recordIndexHasFetchedAllRecordsByGroupComponentState,
      recordGroupId,
    );

  const lastShowPageRecordId = useAtomStateValue(lastShowPageRecordIdState);

  const { scrollToPosition } = useScrollToPosition();

  useEffect(() => {
    if (!loading) {
      setRecordTableData({
        records,
        currentRecordGroupId: recordGroupId,
      });
      setIsRecordTableInitialLoading(false);
      setRecordIndexHasFetchedAllRecordsByGroup(!hasNextPage);
    }
  }, [
    hasNextPage,
    loading,
    records,
    recordGroupId,
    setRecordIndexHasFetchedAllRecordsByGroup,
    setIsRecordTableInitialLoading,
    setRecordTableData,
  ]);

  useEffect(() => {
    if (isNonEmptyString(lastShowPageRecordId)) {
      const recordPosition = records.findIndex(
        (record) => record.id === lastShowPageRecordId,
      );

      if (recordPosition !== -1) {
        const positionInPx = recordPosition * RECORD_TABLE_ROW_HEIGHT;

        scrollToPosition(positionInPx);
      }
    }
  }, [lastShowPageRecordId, records, scrollToPosition]);

  return <></>;
};
