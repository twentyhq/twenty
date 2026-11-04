import { StandardObjectNameSingular } from 'twenty-shared/types';
import { useListenToEventsForQuery } from '@/sse-db-event/hooks/useListenToEventsForQuery';
import { getWorkflowRunSseQueryId } from '@/workflow/utils/getWorkflowRunSseQueryId';

export const WorkflowRunSSESubscribeEffect = ({
  workflowRunId,
}: {
  workflowRunId: string;
}) => {
  const queryId = getWorkflowRunSseQueryId(workflowRunId);

  useListenToEventsForQuery({
    queryId,
    operationSignature: {
      objectNameSingular: StandardObjectNameSingular.WorkflowRun,
      variables: {
        filter: {
          id: { eq: workflowRunId },
        },
      },
    },
  });

  return null;
};
