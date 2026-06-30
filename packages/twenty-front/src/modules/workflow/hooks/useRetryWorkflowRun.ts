import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { dispatchObjectRecordOperationBrowserEvent } from '@/browser-event/utils/dispatchObjectRecordOperationBrowserEvent';
import { useMutation } from '@apollo/client/react';
import { RetryWorkflowRunDocument } from '~/generated/graphql';

export const useRetryWorkflowRun = () => {
  const apolloCoreClient = useApolloCoreClient();
  const [mutate] = useMutation(RetryWorkflowRunDocument, {
    client: apolloCoreClient,
  });

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: CoreObjectNameSingular.WorkflowRun,
  });

  const retryWorkflowRun = async (workflowRunId: string) => {
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

  return { retryWorkflowRun };
};
