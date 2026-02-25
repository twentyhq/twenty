import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useListenToEventsForQuery } from '@/sse-db-event/hooks/useListenToEventsForQuery';

export const WorkflowRunSSESubscribeEffect = ({
  workflowRunId,
}: {
  workflowRunId: string;
}) => {
  const queryId = `workflow-run-${workflowRunId}`;

  useListenToEventsForQuery({
    queryId,
    operationSignature: {
      objectNameSingular: CoreObjectNameSingular.WorkflowRun,
      variables: {
        filter: {
          id: { eq: workflowRunId },
        },
      },
    },
  });

  return null;
};
