import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useGetRecordFromCache } from '@/object-record/cache/hooks/useGetRecordFromCache';
import { useMutation } from '@apollo/client';
import { WorkflowVersionEdgeInput } from '~/generated/graphql';
import { isDefined } from 'twenty-shared/utils';
import { WorkflowVersion } from '@/workflow/types/Workflow';
import { updateRecordFromCache } from '@/object-record/cache/utils/updateRecordFromCache';
import { DELETE_WORKFLOW_VERSION_EDGE } from '@/workflow/graphql/mutations/deleteWorkflowVersionEdge';
import {
  DeleteWorkflowVersionEdgeMutation,
  DeleteWorkflowVersionEdgeMutationVariables,
} from '~/generated-metadata/graphql';

export const useDeleteWorkflowVersionEdge = () => {
  const apolloCoreClient = useApolloCoreClient();

  const { objectMetadataItems } = useObjectMetadataItems();

  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: CoreObjectNameSingular.WorkflowVersion,
  });

  const getRecordFromCache = useGetRecordFromCache({
    objectNameSingular: CoreObjectNameSingular.WorkflowVersion,
  });

  const [mutate] = useMutation<
    DeleteWorkflowVersionEdgeMutation,
    DeleteWorkflowVersionEdgeMutationVariables
  >(DELETE_WORKFLOW_VERSION_EDGE, { client: apolloCoreClient });

  const deleteWorkflowVersionEdge = async (input: WorkflowVersionEdgeInput) => {
    const result = await mutate({ variables: { input } });

    const deletedEdge = result?.data?.deleteWorkflowVersionEdge;

    if (!isDefined(deletedEdge)) {
      return;
    }

    const cachedRecord = getRecordFromCache<WorkflowVersion>(
      input.workflowVersionId,
    );

    if (!isDefined(cachedRecord)) {
      return;
    }

    const { source, target } = input;

    const updatedExistingSteps =
      cachedRecord.steps?.map((existingStep) => {
        if (existingStep.id === source) {
          return {
            ...existingStep,
            nextStepIds: existingStep.nextStepIds?.filter(
              (nextStepId) => nextStepId !== target,
            ),
          };
        }
        return existingStep;
      }) ?? [];

    const newCachedRecord = {
      ...cachedRecord,
      steps: updatedExistingSteps,
    };

    const recordGqlFields = {
      steps: true,
    };

    updateRecordFromCache({
      objectMetadataItems,
      objectMetadataItem,
      cache: apolloCoreClient.cache,
      record: newCachedRecord,
      recordGqlFields,
      objectPermissionsByObjectMetadataId,
    });

    return result;
  };

  return { deleteWorkflowVersionEdge };
};
