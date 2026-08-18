import { useListenToEventsForQuery } from '@/sse-db-event/hooks/useListenToEventsForQuery';

type RecordShowPageSSESubscribeEffectProps = {
  objectNameSingular: string;
  recordId: string;
  // The record page and the side panel can display the same record at the
  // same time; distinct scopes keep their query registrations independent so
  // closing one surface does not unsubscribe the other.
  queryScope?: 'record-show' | 'side-panel-record';
};

export const RecordShowPageSSESubscribeEffect = ({
  objectNameSingular,
  recordId,
  queryScope = 'record-show',
}: RecordShowPageSSESubscribeEffectProps) => {
  const queryId = `${queryScope}-${objectNameSingular}-${recordId}`;

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
