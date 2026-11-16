import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { useListenToEventsForQuery } from '@/sse-db-event/hooks/useListenToEventsForQuery';
import { useMemo } from 'react';
import { isDefined } from 'twenty-shared/utils';

const RecordTableLookupObjectSSESubscribeEffect = ({
  objectNameSingular,
}: {
  objectNameSingular: string;
}) => {
  const operationSignature = useMemo(
    () => ({ objectNameSingular, variables: {} }),
    [objectNameSingular],
  );

  useListenToEventsForQuery({
    queryId: `record-table-lookup-${objectNameSingular}`,
    operationSignature,
  });

  return null;
};

// The table only receives its own object's events, while lookup cells read the related records
export const RecordTableLookupSSESubscribeEffect = () => {
  const { columnDescriptorByRecordFieldId } = useRecordIndexContextOrThrow();

  const relationObjectNamesSingular = [
    ...new Set(
      Object.values(columnDescriptorByRecordFieldId).flatMap(
        ({ lookupTarget }) =>
          isDefined(lookupTarget)
            ? [lookupTarget.relationObjectMetadataItem.nameSingular]
            : [],
      ),
    ),
  ];

  return relationObjectNamesSingular.map((objectNameSingular) => (
    <RecordTableLookupObjectSSESubscribeEffect
      key={objectNameSingular}
      objectNameSingular={objectNameSingular}
    />
  ));
};
