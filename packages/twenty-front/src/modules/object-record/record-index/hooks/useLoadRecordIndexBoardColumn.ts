import { useEffect } from 'react';

import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { useSetRecordIdsForColumn } from '@/object-record/record-board/hooks/useSetRecordIdsForColumn';

import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { useRecordIndexGroupQueryVariables } from '@/object-record/record-index/hooks/useRecordIndexGroupQueryVariables';
import { useUpsertRecordsInStore } from '@/object-record/record-store/hooks/useUpsertRecordsInStore';
import { isDefined } from 'twenty-shared/utils';

type UseLoadRecordIndexBoardProps = {
  columnId: string;
};

export const useLoadRecordIndexBoardColumn = ({
  columnId,
}: UseLoadRecordIndexBoardProps) => {
  const { objectMetadataItem } = useRecordIndexContextOrThrow();
  const { setRecordIdsForColumn } = useSetRecordIdsForColumn();
  const { upsertRecordsInStore } = useUpsertRecordsInStore();

  const queryVariables = useRecordIndexGroupQueryVariables({
    recordGroupId: columnId,
  });

  const { records, loading, fetchMoreRecords, queryIdentifier, hasNextPage } =
    useFindManyRecords({
      objectNameSingular: objectMetadataItem.nameSingular,
      filter: queryVariables?.filters,
      orderBy: queryVariables?.orderBy,
      recordGqlFields: queryVariables?.recordGqlFields,
      limit: 10,
      skip: !isDefined(queryVariables),
    });

  useEffect(() => {
    setRecordIdsForColumn(columnId, records);
  }, [records, setRecordIdsForColumn, columnId]);

  useEffect(() => {
    upsertRecordsInStore(records);
  }, [records, upsertRecordsInStore]);

  return {
    records,
    loading,
    fetchMoreRecords,
    queryIdentifier,
    hasNextPage,
  };
};
