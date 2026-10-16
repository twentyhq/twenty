import { useCallback } from 'react';

import { useRefetchAggregateQueriesForObjectMetadataItem } from '@/object-record/hooks/useRefetchAggregateQueriesForObjectMetadataItem';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { useRecordIndexGroupCommonQueryVariables } from '@/object-record/record-index/hooks/useRecordIndexGroupCommonQueryVariables';
import { useListenToEventsForQuery } from '@/sse-db-event/hooks/useListenToEventsForQuery';

// Each record group refetches its own records on reconnect, see
// useRefetchRecordGroupOnObjectRecordOperation; only aggregates are shared.
export const RecordTableRecordGroupsSSESubscribeEffect = () => {
  const { objectMetadataItem } = useRecordIndexContextOrThrow();
  const { combinedFilters, orderBy } =
    useRecordIndexGroupCommonQueryVariables();

  const { refetchAggregateQueriesForObjectMetadataItem } =
    useRefetchAggregateQueriesForObjectMetadataItem();

  const queryId = `record-table-record-groups-${objectMetadataItem.nameSingular}`;

  const refetchAggregates = useCallback(
    () => refetchAggregateQueriesForObjectMetadataItem({ objectMetadataItem }),
    [objectMetadataItem, refetchAggregateQueriesForObjectMetadataItem],
  );

  useListenToEventsForQuery({
    queryId,
    operationSignature: {
      objectNameSingular: objectMetadataItem.nameSingular,
      variables: {
        filter: combinedFilters,
        orderBy,
      },
    },
    onSseReconnected: refetchAggregates,
  });

  return null;
};
