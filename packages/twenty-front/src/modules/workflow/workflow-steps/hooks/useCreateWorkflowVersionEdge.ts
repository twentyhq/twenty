import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useGetRecordFromCache } from '@/object-record/cache/hooks/useGetRecordFromCache';
import { useMutation } from '@apollo/client';
import {
  CreateWorkflowVersionEdgeMutation,
  CreateWorkflowVersionEdgeMutationVariables,
} from '~/generated-metadata/graphql';
import { CREATE_WORKFLOW_VERSION_EDGE } from '@/workflow/graphql/mutations/createWorkflowVersionEdge';
import { CreateWorkflowVersionEdgeInput } from '~/generated/graphql';
import { isDefined } from 'twenty-shared/utils';
import { WorkflowVersion } from '@/workflow/types/Workflow';
import { updateRecordFromCache } from '@/object-record/cache/utils/updateRecordFromCache';

export const useCreateWorkflowVersionEdge = () => {
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
    CreateWorkflowVersionEdgeMutation,
    CreateWorkflowVersionEdgeMutationVariables
  >(CREATE_WORKFLOW_VERSION_EDGE, { client: apolloCoreClient });

  const createWorkflowVersionEdge = async (
    input: CreateWorkflowVersionEdgeInput,
  ) => {
    const result = await mutate({ variables: { input } });

    const createdEdge = result?.data?.createWorkflowVersionEdge;

    if (!isDefined(createdEdge)) {
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
            nextStepIds: [...(existingStep.nextStepIds ?? []), target],
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

  return {createWorkflowVersionEdge}
};
