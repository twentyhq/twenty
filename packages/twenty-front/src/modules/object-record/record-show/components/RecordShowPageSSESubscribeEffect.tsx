import { useListenToEventsForQuery } from '@/sse-db-event/hooks/useListenToEventsForQuery';
import { useWorkspaceSurfaceScopedComponentInstanceId } from '@/ui/layout/hooks/useWorkspaceSurfaceScopedComponentInstanceId';

type RecordShowPageSSESubscribeEffectProps = {
  objectNameSingular: string;
  recordId: string;
};

export const RecordShowPageSSESubscribeEffect = ({
  objectNameSingular,
  recordId,
}: RecordShowPageSSESubscribeEffectProps) => {
  const queryId = useWorkspaceSurfaceScopedComponentInstanceId(
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
