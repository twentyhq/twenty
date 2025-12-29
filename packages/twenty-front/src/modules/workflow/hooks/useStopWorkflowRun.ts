import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useRegisterObjectOperation } from '@/object-record/hooks/useRegisterObjectOperation';
import { useStopWorkflowRunMutation } from '~/generated-metadata/graphql';

export const useStopWorkflowRun = () => {
  const apolloCoreClient = useApolloCoreClient();
  const [mutate] = useStopWorkflowRunMutation({
    client: apolloCoreClient,
  });
  const { registerObjectOperation } = useRegisterObjectOperation();

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: CoreObjectNameSingular.WorkflowRun,
  });

  const stopWorkflowRun = async (workflowRunId: string) => {
    await mutate({
      variables: {
        workflowRunId,
      },
    });

    registerObjectOperation(objectMetadataItem, {
      type: 'update-one',
      result: {
        updateInput: { id: workflowRunId },
      },
    });
  };

  return { stopWorkflowRun };
};
