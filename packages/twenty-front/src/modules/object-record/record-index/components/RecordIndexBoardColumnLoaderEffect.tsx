import { useEffect } from 'react';
import { useRecoilState, useSetRecoilState } from 'recoil';

import { isRecordBoardFetchingRecordsByColumnFamilyState } from '@/object-record/record-board/states/isRecordBoardFetchingRecordsByColumnFamilyState';
import { recordBoardShouldFetchMoreInColumnComponentFamilyState } from '@/object-record/record-board/states/recordBoardShouldFetchMoreInColumnComponentFamilyState';
import { useLoadRecordIndexBoardColumn } from '@/object-record/record-index/hooks/useLoadRecordIndexBoardColumn';
import { isRecordIndexBoardColumnLoadingFamilyState } from '@/object-record/states/isRecordBoardColumnLoadingFamilyState';
import { getScopeIdFromComponentId } from '@/ui/utilities/recoil-scope/utils/getScopeIdFromComponentId';

export const RecordIndexBoardColumnLoaderEffect = ({
  objectNameSingular,
  boardFieldSelectValue,
  boardFieldMetadataId,
  recordBoardId,
  columnId,
}: {
  recordBoardId: string;
  objectNameSingular: string;
  boardFieldSelectValue: string | null;
  boardFieldMetadataId: string | null;
  columnId: string;
}) => {
  const [shouldFetchMore, setShouldFetchMore] = useRecoilState(
    recordBoardShouldFetchMoreInColumnComponentFamilyState({
      scopeId: getScopeIdFromComponentId(recordBoardId),
      familyKey: columnId,
    }),
  );

  const [loadingRecordsForThisColumn, setLoadingRecordsForThisColumn] =
    useRecoilState(
      isRecordBoardFetchingRecordsByColumnFamilyState({
        scopeId: getScopeIdFromComponentId(recordBoardId),
        familyKey: { columnId },
      }),
    );

  const { fetchMoreRecords, loading, records, hasNextPage } =
    useLoadRecordIndexBoardColumn({
      objectNameSingular,
      recordBoardId,
      boardFieldMetadataId,
      columnFieldSelectValue: boardFieldSelectValue,
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
    boardFieldSelectValue,
    setLoadingRecordsForThisColumn,
    loadingRecordsForThisColumn,

    hasNextPage,
  ]);

  return <></>;
};
