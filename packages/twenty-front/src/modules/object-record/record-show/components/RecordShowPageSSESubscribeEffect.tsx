import { useListenToObjectRecordEventsForQuery } from '@/sse-db-event/hooks/useListenToObjectRecordEventsForQuery';

type RecordShowPageSSESubscribeEffectProps = {
  objectNameSingular: string;
  recordId: string;
};

export const RecordShowPageSSESubscribeEffect = ({
  objectNameSingular,
  recordId,
}: RecordShowPageSSESubscribeEffectProps) => {
  const queryId = `record-show-${objectNameSingular}-${recordId}`;

  useListenToObjectRecordEventsForQuery({
    queryId,
    operationSignature: {
      objectNameSingular,
      variables: {
        filter: { id: { eq: recordId } },
        limit: 1,
      },
    },
  });

  return null;
};
