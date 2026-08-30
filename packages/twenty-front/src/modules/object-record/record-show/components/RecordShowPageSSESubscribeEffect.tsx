import { useListenToEventsForQuery } from '@/sse-db-event/hooks/useListenToEventsForQuery';
import { useSurfaceScopedComponentInstanceId } from '@/side-panel/routing/hooks/useSurfaceScopedComponentInstanceId';

type RecordShowPageSSESubscribeEffectProps = {
  objectNameSingular: string;
  recordId: string;
};

export const RecordShowPageSSESubscribeEffect = ({
  objectNameSingular,
  recordId,
}: RecordShowPageSSESubscribeEffectProps) => {
  // The record page and the side panel can display the same record at the same
  // time; scoping the registration to the surface keeps closing one from
  // unsubscribing the other.
  const queryId = useSurfaceScopedComponentInstanceId(
    `record-show-${objectNameSingular}-${recordId}`,
  );

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
