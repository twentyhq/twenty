import { useListenToEventsForQuery } from '@/sse-db-event/hooks/useListenToEventsForQuery';

type RecordShowPageSSESubscribeEffectProps = {
  objectNameSingular: string;
  recordId: string;
};

export const RecordShowPageSSESubscribeEffect = ({
  objectNameSingular,
  recordId,
}: RecordShowPageSSESubscribeEffectProps) => {
  const queryId = `record-show-${objectNameSingular}-${recordId}`;

  useListenToEventsForQuery({
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
