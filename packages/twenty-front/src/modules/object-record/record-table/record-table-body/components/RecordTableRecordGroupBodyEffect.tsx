import { useEffect } from 'react';
import { useStore } from 'jotai';

import { useCurrentRecordGroupId } from '@/object-record/record-group/hooks/useCurrentRecordGroupId';
import { useRecordIndexTableQuery } from '@/object-record/record-index/hooks/useRecordIndexTableQuery';
import { recordIndexHasFetchedAllRecordsByGroupComponentState } from '@/object-record/record-index/states/recordIndexHasFetchedAllRecordsByGroupComponentState';
import { recordIndexRecordToRevealComponentState } from '@/object-record/record-index/states/recordIndexRecordToRevealComponentState';
import { recordIndexAllRecordIdsComponentSelector } from '@/object-record/record-index/states/selectors/recordIndexAllRecordIdsComponentSelector';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { useFocusedRecordTableRow } from '@/object-record/record-table/hooks/useFocusedRecordTableRow';
import { useSetRecordTableData } from '@/object-record/record-table/hooks/internal/useSetRecordTableData';
import { isRecordTableInitialLoadingComponentState } from '@/object-record/record-table/states/isRecordTableInitialLoadingComponentState';
import { isFetchingMoreRecordsFamilyState } from '@/object-record/states/isFetchingMoreRecordsFamilyState';
import { useAtomComponentSelectorCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorCallbackState';
import { useAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentState';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { useSetAtomComponentFamilyState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentFamilyState';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { isDefined } from 'twenty-shared/utils';

export const RecordTableRecordGroupBodyEffect = () => {
  const { objectNameSingular } = useRecordTableContextOrThrow();
  const { recordTableId } = useRecordTableContextOrThrow();

  const store = useStore();

  const setRecordTableData = useSetRecordTableData({
    recordTableId,
  });

  const setIsRecordTableInitialLoading = useSetAtomComponentState(
    isRecordTableInitialLoadingComponentState,
  );

  const recordGroupId = useCurrentRecordGroupId();

  const { records, loading, hasNextPage, fetchMoreRecords, queryIdentifier } =
    useRecordIndexTableQuery(objectNameSingular);

  const isFetchingMoreRecords = useAtomFamilyStateValue(
    isFetchingMoreRecordsFamilyState,
    queryIdentifier,
  );

  const setRecordIndexHasFetchedAllRecordsByGroup =
    useSetAtomComponentFamilyState(
      recordIndexHasFetchedAllRecordsByGroupComponentState,
      recordGroupId,
    );

  const [recordIndexRecordToReveal, setRecordIndexRecordToReveal] =
    useAtomComponentState(recordIndexRecordToRevealComponentState);

  const allRecordIdsCallbackState = useAtomComponentSelectorCallbackState(
    recordIndexAllRecordIdsComponentSelector,
  );

  const { focusRecordTableRow } = useFocusedRecordTableRow(recordTableId);

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
    if (
      !isDefined(recordIndexRecordToReveal) ||
      recordIndexRecordToReveal.recordGroupId !== recordGroupId ||
      loading ||
      isFetchingMoreRecords
    ) {
      return;
    }

    const isRecordLoaded = records.some(
      (record) => record.id === recordIndexRecordToReveal.recordId,
    );

    if (isRecordLoaded) {
      setRecordIndexRecordToReveal(null);

      // Rows are focused by their index across all groups, which the effect
      // above has just refreshed in the store from this group's records.
      const rowIndex = store
        .get(allRecordIdsCallbackState)
        .indexOf(recordIndexRecordToReveal.recordId);

      if (rowIndex !== -1) {
        focusRecordTableRow(rowIndex);
      }

      return;
    }

    const isRecordBeyondLoadedPages =
      records.length <= recordIndexRecordToReveal.positionInGroup;

    if (isRecordBeyondLoadedPages && hasNextPage) {
      fetchMoreRecords();

      return;
    }

    setRecordIndexRecordToReveal(null);
  }, [
    recordIndexRecordToReveal,
    setRecordIndexRecordToReveal,
    recordGroupId,
    loading,
    isFetchingMoreRecords,
    records,
    hasNextPage,
    fetchMoreRecords,
    store,
    allRecordIdsCallbackState,
    focusRecordTableRow,
  ]);

  return <></>;
};
