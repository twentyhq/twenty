import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useGetRecordFromCache } from '@/object-record/cache/hooks/useGetRecordFromCache';
import { updateRecordFromCache } from '@/object-record/cache/utils/updateRecordFromCache';
import { UPDATE_WORKFLOW_RUN_STEP } from '@/workflow/graphql/mutations/updateWorkflowRunStep';
import { WorkflowRun } from '@/workflow/types/Workflow';
import { useApolloClient, useMutation } from '@apollo/client';
import { isDefined } from 'twenty-shared/utils';
import {
  UpdateWorkflowRunStepInput,
  UpdateWorkflowRunStepMutation,
  UpdateWorkflowRunStepMutationVariables,
  WorkflowAction,
} from '~/generated/graphql';

export const useUpdateWorkflowRunStep = () => {
  const apolloClient = useApolloClient();
  const { objectMetadataItems } = useObjectMetadataItems();
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: CoreObjectNameSingular.WorkflowRun,
  });

  const [mutate] = useMutation<
    UpdateWorkflowRunStepMutation,
    UpdateWorkflowRunStepMutationVariables
  >(UPDATE_WORKFLOW_RUN_STEP, {
    client: apolloClient,
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
      !isDefined(cachedRecord?.output?.flow?.steps)
    ) {
      return;
    }

    const newCachedRecord = {
      ...cachedRecord,
      output: {
        ...cachedRecord.output,
        flow: {
          ...cachedRecord.output.flow,
          steps: cachedRecord.output.flow.steps.map((step: WorkflowAction) => {
            if (step.id === updatedStep.id) {
              return updatedStep;
            }
            return step;
          }),
        },
      },
    };

    const recordGqlFields = {
      output: true,
    };
    updateRecordFromCache({
      objectMetadataItems,
      objectMetadataItem,
      cache: apolloClient.cache,
      record: newCachedRecord,
      recordGqlFields,
    });

    return updatedStep;
  };

  return { updateWorkflowRunStep };
};
