import { useEffect } from 'react';
import { useRecoilValue } from 'recoil';

import { useRecordBoard } from '@/object-record/record-board/hooks/useRecordBoard';
import { useLoadRecordIndexBoardColumn } from '@/object-record/record-index/hooks/useLoadRecordIndexBoardColumn';

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
  const { shouldFetchMoreSelector } = useRecordBoard(recordBoardId);

  const shouldFetchMore = useRecoilValue(shouldFetchMoreSelector());

  const { fetchMoreRecords, loading } = useLoadRecordIndexBoardColumn({
    objectNameSingular,
    recordBoardId,
    boardFieldMetadataId,
    columnFieldSelectValue: boardFieldSelectValue,
    columnId,
  });

  useEffect(() => {
    if (!loading && shouldFetchMore) {
      fetchMoreRecords?.();
    }
  }, [fetchMoreRecords, loading, shouldFetchMore, boardFieldSelectValue]);

  return <></>;
};
