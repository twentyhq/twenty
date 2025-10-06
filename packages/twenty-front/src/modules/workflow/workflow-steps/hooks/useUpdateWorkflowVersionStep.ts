import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useGetRecordFromCache } from '@/object-record/cache/hooks/useGetRecordFromCache';
import { updateRecordFromCache } from '@/object-record/cache/utils/updateRecordFromCache';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { UPDATE_WORKFLOW_VERSION_STEP } from '@/workflow/graphql/mutations/updateWorkflowVersionStep';
import {
  type WorkflowVersion,
  type WorkflowStep,
} from '@/workflow/types/Workflow';
import { useMutation } from '@apollo/client';
import { isDefined } from 'twenty-shared/utils';
import {
  type UpdateWorkflowVersionStepInput,
  type UpdateWorkflowVersionStepMutation,
  type UpdateWorkflowVersionStepMutationVariables,
} from '~/generated-metadata/graphql';

export const useUpdateWorkflowVersionStep = () => {
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
    UpdateWorkflowVersionStepMutation,
    UpdateWorkflowVersionStepMutationVariables
  >(UPDATE_WORKFLOW_VERSION_STEP, {
    client: apolloCoreClient,
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
    if (!isDefined(cachedRecord)) {
      return;
    }

    const newCachedRecord = {
      ...cachedRecord,
      steps: (cachedRecord.steps || []).map((step: WorkflowStep) => {
        if (step.id === updatedStep.id) {
          return updatedStep;
        }
        return step;
      }),
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

  return { updateWorkflowVersionStep };
};
