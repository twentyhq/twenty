import { useCallback } from 'react';

import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useRefetchAggregateQueriesForObjectMetadataItem } from '@/object-record/hooks/useRefetchAggregateQueriesForObjectMetadataItem';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { useRecordIndexGroupCommonQueryVariables } from '@/object-record/record-index/hooks/useRecordIndexGroupCommonQueryVariables';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { useListenToEventsForQuery } from '@/sse-db-event/hooks/useListenToEventsForQuery';
import { capitalize } from 'twenty-shared/utils';

export const RecordTableRecordGroupsSSESubscribeEffect = () => {
  const { objectMetadataItem } = useRecordIndexContextOrThrow();
  const { recordTableId } = useRecordTableContextOrThrow();
  const { combinedFilters, orderBy } =
    useRecordIndexGroupCommonQueryVariables();

  const apolloCoreClient = useApolloCoreClient();

  const { refetchAggregateQueriesForObjectMetadataItem } =
    useRefetchAggregateQueriesForObjectMetadataItem();

  const queryId = `record-table-record-groups-${recordTableId}`;

  const resyncRecordGroups = useCallback(async () => {
    const findManyRecordsQueryName = `FindMany${capitalize(
      objectMetadataItem.namePlural,
    )}`;

    // Including by name would also re-run skipped queries of this object
    await Promise.all([
      apolloCoreClient.refetchQueries({
        include: 'active',
        onQueryUpdated: (observableQuery) =>
          observableQuery.queryName === findManyRecordsQueryName,
      }),
      refetchAggregateQueriesForObjectMetadataItem({ objectMetadataItem }),
    ]);
  }, [
    apolloCoreClient,
    objectMetadataItem,
    refetchAggregateQueriesForObjectMetadataItem,
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
