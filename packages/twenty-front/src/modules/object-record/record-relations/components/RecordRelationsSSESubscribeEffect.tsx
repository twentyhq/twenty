// SOURCING: twentyhq/twenty RecordListSSESubscribeEffect (PR #23829) — fork-local RELATIONS view
import { useRefetchFindManyRecords } from '@/object-record/hooks/useRefetchFindManyRecords';
import { useFindManyRecordIndexTableParams } from '@/object-record/record-index/hooks/useFindManyRecordIndexTableParams';
import { useRecordRelationsContextOrThrow } from '@/object-record/record-relations/contexts/RecordRelationsContext';
import { RecordRelationsComponentInstanceContext } from '@/object-record/record-relations/states/contexts/RecordRelationsComponentInstanceContext';
import { useListenToEventsForQuery } from '@/sse-db-event/hooks/useListenToEventsForQuery';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';

export const RecordRelationsSSESubscribeEffect = () => {
  const recordRelationsId = useAvailableComponentInstanceIdOrThrow(
    RecordRelationsComponentInstanceContext,
  );

  const { objectNameSingular, objectMetadataItem } =
    useRecordRelationsContextOrThrow();

  const { filter, orderBy } =
    useFindManyRecordIndexTableParams(objectNameSingular);

  const { refetchFindManyRecords } = useRefetchFindManyRecords({
    objectMetadataNamePlural: objectMetadataItem.namePlural,
  });

  const queryId = `record-relations-${recordRelationsId}`;

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
