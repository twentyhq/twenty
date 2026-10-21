import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { useRecordIndexGroupCommonQueryVariables } from '@/object-record/record-index/hooks/useRecordIndexGroupCommonQueryVariables';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { useListenToEventsForQuery } from '@/sse-db-event/hooks/useListenToEventsForQuery';

export const RecordTableRecordGroupsSSESubscribeEffect = () => {
  const { objectMetadataItem } = useRecordIndexContextOrThrow();
  const { recordTableId } = useRecordTableContextOrThrow();
  const { combinedFilters, orderBy } =
    useRecordIndexGroupCommonQueryVariables();

  useListenToEventsForQuery({
    queryId: `record-table-record-groups-${recordTableId}`,
    operationSignature: {
      objectNameSingular: objectMetadataItem.nameSingular,
      variables: {
        filter: combinedFilters,
        orderBy,
      },
    },
  });

  return null;
};
