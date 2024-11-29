import { useApolloClient, useMutation } from '@apollo/client';
import {
  DeleteWorkflowVersionStepMutation,
  DeleteWorkflowVersionStepMutationVariables,
  DeleteWorkflowVersionStepInput,
  WorkflowAction,
} from '~/generated/graphql';
import { DELETE_WORKFLOW_VERSION_STEP } from '@/workflow/graphql/mutations/deleteWorkflowVersionStep';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useGetRecordFromCache } from '@/object-record/cache/hooks/useGetRecordFromCache';
import { isDefined } from 'packages/twenty-ui';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { updateRecordFromCache } from '@/object-record/cache/utils/updateRecordFromCache';

export const useDeleteWorkflowVersionStep = () => {
  const apolloClient = useApolloClient();
  const { objectMetadataItems } = useObjectMetadataItems();
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: CoreObjectNameSingular.WorkflowVersion,
  });
  const getRecordFromCache = useGetRecordFromCache({
    objectNameSingular: CoreObjectNameSingular.WorkflowVersion,
  });
  const [mutate] = useMutation<
    DeleteWorkflowVersionStepMutation,
    DeleteWorkflowVersionStepMutationVariables
  >(DELETE_WORKFLOW_VERSION_STEP, {
    client: apolloClient,
  });
  const deleteWorkflowVersionStep = async (
    input: DeleteWorkflowVersionStepInput,
  ) => {
    const result = await mutate({ variables: { input } });
    const deletedStep = result?.data?.deleteWorkflowVersionStep;
    if (!isDefined(deletedStep)) {
      return;
    }

    const cachedRecord = getRecordFromCache<ObjectRecord>(
      input.workflowVersionId,
    );
    if (!cachedRecord) {
      return;
    }

    const newCachedRecord = {
      ...cachedRecord,
      steps: cachedRecord.steps.filter(
        (step: WorkflowAction) => step.id !== deletedStep.id,
      ),
    };

    updateRecordFromCache({
      objectMetadataItems,
      objectMetadataItem,
      cache: apolloClient.cache,
      record: newCachedRecord,
    });
  };

  return { deleteWorkflowVersionStep };
};
