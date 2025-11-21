import { useEffect } from 'react';
import { useRecoilState, useSetRecoilState } from 'recoil';

import { isRecordBoardFetchingRecordsByColumnFamilyState } from '@/object-record/record-board/states/isRecordBoardFetchingRecordsByColumnFamilyState';
import { recordBoardShouldFetchMoreInColumnComponentFamilyState } from '@/object-record/record-board/states/recordBoardShouldFetchMoreInColumnComponentFamilyState';
import { useLoadRecordIndexBoardColumn } from '@/object-record/record-index/hooks/useLoadRecordIndexBoardColumn';
import { isRecordIndexBoardColumnLoadingFamilyState } from '@/object-record/states/isRecordBoardColumnLoadingFamilyState';
import { useRecoilComponentFamilyState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentFamilyState';

export const RecordIndexBoardColumnFetchMoreEffect = ({
  columnId,
}: {
  columnId: string;
}) => {
  const [shouldFetchMore, setShouldFetchMore] = useRecoilComponentFamilyState(
    recordBoardShouldFetchMoreInColumnComponentFamilyState,
    columnId,
  );

  const [loadingRecordsForThisColumn, setLoadingRecordsForThisColumn] =
    useRecoilState(isRecordBoardFetchingRecordsByColumnFamilyState(columnId));

  const { fetchMoreRecords, loading, records, hasNextPage } =
    useLoadRecordIndexBoardColumn({
      columnId,
    });

  const setIsRecordIndexLoading = useSetRecoilState(
    isRecordIndexBoardColumnLoadingFamilyState(columnId),
  );

  useEffect(() => {
    setIsRecordIndexLoading(loading && records.length === 0);
  }, [records, loading, setIsRecordIndexLoading]);

  useEffect(() => {
    const run = async () => {
      if (!loading && shouldFetchMore && hasNextPage) {
        setLoadingRecordsForThisColumn(true);
        setShouldFetchMore(false);

        await fetchMoreRecords?.();

        setLoadingRecordsForThisColumn(false);
      }
    };

    run();
  }, [
    setShouldFetchMore,
    fetchMoreRecords,
    loading,
    shouldFetchMore,
    setLoadingRecordsForThisColumn,
    loadingRecordsForThisColumn,

    hasNextPage,
  ]);

  return <></>;
};
