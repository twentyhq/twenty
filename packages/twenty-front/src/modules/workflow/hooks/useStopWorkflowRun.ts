import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { dispatchObjectRecordOperationBrowserEvent } from '@/browser-event/utils/dispatchObjectRecordOperationBrowserEvent';
import { useStopWorkflowRunMutation } from '~/generated/graphql';

export const useStopWorkflowRun = () => {
  const apolloCoreClient = useApolloCoreClient();
  const [mutate] = useStopWorkflowRunMutation({
    client: apolloCoreClient,
  });

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: CoreObjectNameSingular.WorkflowRun,
  });

  const stopWorkflowRun = async (workflowRunId: string) => {
    await mutate({
      variables: {
        workflowRunId,
      },
    });

    dispatchObjectRecordOperationBrowserEvent({
      objectMetadataItem,
      operation: {
        type: 'update-one',
        result: {
          updateInput: {
            recordId: workflowRunId,
            updatedFields: [],
          },
        },
      },
    });
  };

  return { stopWorkflowRun };
};
