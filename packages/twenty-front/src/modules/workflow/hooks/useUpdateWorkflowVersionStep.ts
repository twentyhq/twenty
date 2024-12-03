import { useApolloClient, useMutation } from '@apollo/client';
import {
  UpdateWorkflowVersionStepInput,
  UpdateWorkflowVersionStepMutation,
  UpdateWorkflowVersionStepMutationVariables,
  WorkflowAction,
} from '~/generated/graphql';
import { UPDATE_WORKFLOW_VERSION_STEP } from '@/workflow/graphql/mutations/updateWorkflowVersionStep';
import { updateRecordFromCache } from '@/object-record/cache/utils/updateRecordFromCache';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useGetRecordFromCache } from '@/object-record/cache/hooks/useGetRecordFromCache';
import { isDefined } from 'twenty-ui';
import { WorkflowVersion } from '@/workflow/types/Workflow';

export const useUpdateWorkflowVersionStep = () => {
  const apolloClient = useApolloClient();
  const { objectMetadataItems } = useObjectMetadataItems();
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: CoreObjectNameSingular.WorkflowVersion,
  });
  const getRecordFromCache = useGetRecordFromCache({
    objectNameSingular: CoreObjectNameSingular.WorkflowVersion,
  });
  const [mutate] = useMutation<
    UpdateWorkflowVersionStepMutation,
    UpdateWorkflowVersionStepMutationVariables
  >(UPDATE_WORKFLOW_VERSION_STEP, {
    client: apolloClient,
  });

  const updateWorkflowVersionStep = async (
    input: UpdateWorkflowVersionStepInput,
  ) => {
    const result = await mutate({ variables: { input } });
    const updatedStep = result?.data?.updateWorkflowVersionStep;
    if (!isDefined(updatedStep)) {
      return;
    }

    const cachedRecord = getRecordFromCache<WorkflowVersion>(
      input.workflowVersionId,
    );
    if (!cachedRecord) {
      return;
    }

    const newCachedRecord = {
      ...cachedRecord,
      steps: (cachedRecord.steps || []).map((step: WorkflowAction) => {
        if (step.id === updatedStep.id) {
          return updatedStep;
        }
        return step;
      }),
    };

    updateRecordFromCache({
      objectMetadataItems,
      objectMetadataItem,
      cache: apolloClient.cache,
      record: newCachedRecord,
    });
    return result;
  };

  return { updateWorkflowVersionStep };
};
