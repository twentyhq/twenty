import { useCallback } from 'react';

import { useRefetchAggregateQueriesForObjectMetadataItem } from '@/object-record/hooks/useRefetchAggregateQueriesForObjectMetadataItem';
import { useRefetchFindManyRecords } from '@/object-record/hooks/useRefetchFindManyRecords';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { useRecordIndexGroupCommonQueryVariables } from '@/object-record/record-index/hooks/useRecordIndexGroupCommonQueryVariables';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { useListenToEventsForQuery } from '@/sse-db-event/hooks/useListenToEventsForQuery';

export const RecordTableRecordGroupsSSESubscribeEffect = () => {
  const { objectMetadataItem } = useRecordIndexContextOrThrow();
  const { recordTableId } = useRecordTableContextOrThrow();
  const { combinedFilters, orderBy } =
    useRecordIndexGroupCommonQueryVariables();

  const { refetchFindManyRecords } = useRefetchFindManyRecords({
    objectMetadataNamePlural: objectMetadataItem.namePlural,
  });

  const { refetchAggregateQueriesForObjectMetadataItem } =
    useRefetchAggregateQueriesForObjectMetadataItem();

  const queryId = `record-table-record-groups-${recordTableId}`;

  const resyncRecordGroups = useCallback(async () => {
    await Promise.all([
      refetchFindManyRecords(),
      refetchAggregateQueriesForObjectMetadataItem({ objectMetadataItem }),
    ]);
  }, [
    objectMetadataItem,
    refetchAggregateQueriesForObjectMetadataItem,
    refetchFindManyRecords,
  ]);

  useListenToEventsForQuery({
    queryId,
    operationSignature: {
      objectNameSingular: objectMetadataItem.nameSingular,
      variables: {
        filter: combinedFilters,
        orderBy,
      },
    },
    onSseReconnected: resyncRecordGroups,
  });

  return null;
};
