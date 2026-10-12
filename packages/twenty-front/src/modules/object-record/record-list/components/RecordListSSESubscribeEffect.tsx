import { useRefetchFindManyRecords } from '@/object-record/hooks/useRefetchFindManyRecords';
import { useFindManyRecordIndexTableParams } from '@/object-record/record-index/hooks/useFindManyRecordIndexTableParams';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { RecordListComponentInstanceContext } from '@/object-record/record-list/states/contexts/RecordListComponentInstanceContext';
import { useListenToEventsForQuery } from '@/sse-db-event/hooks/useListenToEventsForQuery';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';

export const RecordListSSESubscribeEffect = () => {
  const recordListId = useAvailableComponentInstanceIdOrThrow(
    RecordListComponentInstanceContext,
  );

  const { objectNameSingular, objectMetadataItem } =
    useRecordIndexContextOrThrow();

  const { filter, orderBy } =
    useFindManyRecordIndexTableParams(objectNameSingular);

  const { refetchFindManyRecords } = useRefetchFindManyRecords({
    objectMetadataNamePlural: objectMetadataItem.namePlural,
  });

  const queryId = `record-list-${recordListId}`;

  useListenToEventsForQuery({
    queryId,
    operationSignature: {
      objectNameSingular: objectMetadataItem.nameSingular,
      variables: {
        filter,
        orderBy,
      },
    },
    onSseReconnected: refetchFindManyRecords,
  });

  return null;
};
