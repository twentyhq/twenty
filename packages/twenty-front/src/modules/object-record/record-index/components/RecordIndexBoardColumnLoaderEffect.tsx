import { useEffect } from 'react';
import { useRecoilState } from 'recoil';

import { isRecordBoardFetchingRecordsByColumnFamilyState } from '@/object-record/record-board/states/isRecordBoardFetchingRecordsByColumnFamilyState';
import { recordBoardShouldFetchMoreInColumnComponentFamilyState } from '@/object-record/record-board/states/recordBoardShouldFetchMoreInColumnComponentFamilyState';
import { useLoadRecordIndexBoardColumn } from '@/object-record/record-index/hooks/useLoadRecordIndexBoardColumn';
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
  boardFieldSelectValue: string;
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

  const { fetchMoreRecords, loading, hasNextPage } =
    useLoadRecordIndexBoardColumn({
      objectNameSingular,
      recordBoardId,
      boardFieldMetadataId,
      columnFieldSelectValue: boardFieldSelectValue,
      columnId,
    });

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
