import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useListenToObjectRecordEventsForQuery } from '@/sse-db-event/hooks/useListenToObjectRecordEventsForQuery';

export const WorkflowRunSSESubscribeEffect = ({
  workflowRunId,
}: {
  workflowRunId: string;
}) => {
  const queryId = `workflow-run-${workflowRunId}`;

  useListenToObjectRecordEventsForQuery({
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
