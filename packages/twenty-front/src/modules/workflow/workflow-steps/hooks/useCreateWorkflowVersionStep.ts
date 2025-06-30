import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useGetRecordFromCache } from '@/object-record/cache/hooks/useGetRecordFromCache';
import { updateRecordFromCache } from '@/object-record/cache/utils/updateRecordFromCache';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { CREATE_WORKFLOW_VERSION_STEP } from '@/workflow/graphql/mutations/createWorkflowVersionStep';
import { WorkflowVersion } from '@/workflow/types/Workflow';
import { useApolloClient, useMutation } from '@apollo/client';
import { isDefined } from 'twenty-shared/utils';
import {
  CreateWorkflowVersionStepInput,
  CreateWorkflowVersionStepMutation,
  CreateWorkflowVersionStepMutationVariables,
} from '~/generated/graphql';

export const useCreateWorkflowVersionStep = () => {
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
    CreateWorkflowVersionStepMutation,
    CreateWorkflowVersionStepMutationVariables
  >(CREATE_WORKFLOW_VERSION_STEP, {
    client: apolloClient,
  });
  const createWorkflowVersionStep = async (
    input: CreateWorkflowVersionStepInput,
  ) => {
    const result = await mutate({
      variables: { input },
    });

    const insertedStep = result?.data?.createWorkflowVersionStep;

    if (!isDefined(insertedStep)) {
      return;
    }

    const cachedRecord = getRecordFromCache<WorkflowVersion>(
      input.workflowVersionId,
    );

    if (!isDefined(cachedRecord)) {
      return;
    }

    const { parentStepId, nextStepId } = input;

    const updatedExistingSteps =
      cachedRecord.steps?.map((existingStep) => {
        if (existingStep.id === parentStepId) {
          return {
            ...existingStep,
            nextStepIds: [
              ...new Set([
                ...(existingStep.nextStepIds?.filter(
                  (id) => id !== nextStepId,
                ) || []),
                insertedStep.id,
              ]),
            ],
          };
        }
        return existingStep;
      }) ?? [];

    const newCachedRecord = {
      ...cachedRecord,
      steps: [...updatedExistingSteps, insertedStep],
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
    return result;
  };

  return { createWorkflowVersionStep };
};
