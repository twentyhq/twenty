import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useGetRecordFromCache } from '@/object-record/cache/hooks/useGetRecordFromCache';
import { updateRecordFromCache } from '@/object-record/cache/utils/updateRecordFromCache';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { UPDATE_WORKFLOW_RUN_STEP } from '@/workflow/graphql/mutations/updateWorkflowRunStep';
import { type WorkflowStep, type WorkflowRun } from '@/workflow/types/Workflow';
import { useMutation } from '@apollo/client';
import { isDefined } from 'twenty-shared/utils';
import {
  type UpdateWorkflowRunStepInput,
  type UpdateWorkflowRunStepMutation,
  type UpdateWorkflowRunStepMutationVariables,
} from '~/generated-metadata/graphql';

export const useUpdateWorkflowRunStep = () => {
  const apolloCoreClient = useApolloCoreClient();
  const { objectMetadataItems } = useObjectMetadataItems();
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: CoreObjectNameSingular.WorkflowRun,
  });
  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();
  const [mutate] = useMutation<
    UpdateWorkflowRunStepMutation,
    UpdateWorkflowRunStepMutationVariables
  >(UPDATE_WORKFLOW_RUN_STEP, {
    client: apolloCoreClient,
  });

  const getRecordFromCache = useGetRecordFromCache({
    objectNameSingular: CoreObjectNameSingular.WorkflowRun,
  });

  const updateWorkflowRunStep = async (input: UpdateWorkflowRunStepInput) => {
    const result = await mutate({
      variables: {
        input: { workflowRunId: input.workflowRunId, step: input.step },
      },
    });
    const updatedStep = result?.data?.updateWorkflowRunStep;
    if (!isDefined(updatedStep)) {
      return;
    }

    const cachedRecord = getRecordFromCache<WorkflowRun>(input.workflowRunId);

    if (
      !isDefined(cachedRecord) ||
      !isDefined(cachedRecord?.state?.flow?.steps)
    ) {
      return;
    }

    const newCachedRecord = {
      ...cachedRecord,
      state: {
        ...cachedRecord.state,
        flow: {
          ...cachedRecord.state.flow,
          steps: cachedRecord.state.flow.steps.map((step: WorkflowStep) => {
            if (step.id === updatedStep.id) {
              return updatedStep;
            }
            return step;
          }),
        },
      },
    };

    const recordGqlFields = {
      state: true,
    };
    updateRecordFromCache({
      objectMetadataItems,
      objectMetadataItem,
      cache: apolloCoreClient.cache,
      record: newCachedRecord,
      recordGqlFields,
      objectPermissionsByObjectMetadataId,
    });

    return updatedStep;
  };

  return { updateWorkflowRunStep };
};
