import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { WorkflowRun } from '@/workflow/types/Workflow';
import { workflowRunSchema } from '@/workflow/validation-schemas/workflowSchema';
import { useOnDbEvent } from '@/subscription/hooks/useOnDbEvent';
import { useApolloClient } from '@apollo/client';

export const useWorkflowRun = ({
  workflowRunId,
  trackUpdates = false,
}: {
  workflowRunId: string;
  trackUpdates?: boolean;
}): WorkflowRun | undefined => {
  const { record: rawRecord } = useFindOneRecord({
    objectNameSingular: CoreObjectNameSingular.WorkflowRun,
    objectRecordId: workflowRunId,
  });
  const apolloClient = useApolloClient();

  const { success, data: record } = workflowRunSchema.safeParse(rawRecord);

  useOnDbEvent({
    input: { recordId: workflowRunId },
    skip: trackUpdates,
    onData: ({ data }) => {
      const updatedWorkflowRun = data?.onDbEvent?.record;
      if (!updatedWorkflowRun) return;

      apolloClient.cache.modify({
        id: apolloClient.cache.identify({
          __typename: 'WorkflowRun',
          id: workflowRunId,
        }),
        fields: {
          status: () => updatedWorkflowRun.status,
          output: () => updatedWorkflowRun.output,
        },
      });
    },
  });

  if (!success) {
    return undefined;
  }

  return record;
};
