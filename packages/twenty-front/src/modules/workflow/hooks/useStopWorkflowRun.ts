import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useRegisterObjectOperation } from '@/object-record/hooks/useRegisterObjectOperation';
import { useStopWorkflowRunMutation } from '~/generated-metadata/graphql';

export const useStopWorkflowRun = () => {
  const apolloCoreClient = useApolloCoreClient();
  const [mutate] = useStopWorkflowRunMutation({
    client: apolloCoreClient,
  });
  const { registerObjectOperation } = useRegisterObjectOperation();

  const stopWorkflowRun = async (workflowRunId: string) => {
    const { data } = await mutate({
      variables: {
        workflowRunId,
      },
    });

    registerObjectOperation('workflowRun', {
      type: 'update-one',
      result: {
        updatedRecord: data?.stopWorkflowRun,
        updateInput: { id: workflowRunId },
      },
    });
  };

  return { stopWorkflowRun };
};
