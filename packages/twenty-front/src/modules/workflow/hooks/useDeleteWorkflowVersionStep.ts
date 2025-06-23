import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useGetRecordFromCache } from '@/object-record/cache/hooks/useGetRecordFromCache';
import { updateRecordFromCache } from '@/object-record/cache/utils/updateRecordFromCache';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { DELETE_WORKFLOW_VERSION_STEP } from '@/workflow/graphql/mutations/deleteWorkflowVersionStep';
import { WorkflowVersion } from '@/workflow/types/Workflow';
import { useApolloClient, useMutation } from '@apollo/client';
import { isDefined } from 'twenty-shared/utils';
import {
  DeleteWorkflowVersionStepInput,
  DeleteWorkflowVersionStepMutation,
  DeleteWorkflowVersionStepMutationVariables,
  WorkflowAction,
} from '~/generated/graphql';

export const useDeleteWorkflowVersionStep = () => {
  const apolloClient = useApolloClient();
  const { objectMetadataItems } = useObjectMetadataItems();
  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();
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

    const cachedRecord = getRecordFromCache<WorkflowVersion>(
      input.workflowVersionId,
    );

    if (!isDefined(cachedRecord)) {
      return;
    }

    const newCachedRecord = {
      ...cachedRecord,
      steps: (cachedRecord.steps || [])
        .filter((step: WorkflowAction) => step.id !== deletedStep.id)
        .map((step: WorkflowAction) => {
          if (!step.nextStepIds?.includes(deletedStep.id)) {
            return step;
          }

          return {
            ...step,
            nextStepIds: [
              ...new Set([
                ...(step.nextStepIds?.filter(
                  (nextStepId) => nextStepId !== deletedStep.id,
                ) || []),
                ...(deletedStep.nextStepIds || []),
              ]),
            ],
          };
        }),
    };

    const recordGqlFields = {
      steps: true,
    };

    updateRecordFromCache({
      objectMetadataItems,
      objectMetadataItem,
      cache: apolloClient.cache,
      record: newCachedRecord,
      recordGqlFields,
      objectPermissionsByObjectMetadataId,
    });
  };

  return { deleteWorkflowVersionStep };
};
