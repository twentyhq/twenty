import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindOneRecordQuery } from '@/object-record/hooks/useFindOneRecordQuery';
import { DELETE_WORKFLOW_VERSION_STEP } from '@/workflow/graphql/mutations/deleteWorkflowVersionStep';
import { useUpdateWorkflowVersionCache } from '@/workflow/workflow-steps/hooks/useUpdateWorkflowVersionCache';
import { useMutation } from '@apollo/client';
import {
  type DeleteWorkflowVersionStepInput,
  type DeleteWorkflowVersionStepMutation,
  type DeleteWorkflowVersionStepMutationVariables,
} from '~/generated/graphql';

export const useDeleteWorkflowVersionStep = () => {
  const apolloCoreClient = useApolloCoreClient();

  const { updateWorkflowVersionCache } = useUpdateWorkflowVersionCache();

  const { findOneRecordQuery: findOneWorkflowVersionQuery } =
    useFindOneRecordQuery({
      objectNameSingular: CoreObjectNameSingular.WorkflowVersion,
    });

  const [mutate] = useMutation<
    DeleteWorkflowVersionStepMutation,
    DeleteWorkflowVersionStepMutationVariables
  >(DELETE_WORKFLOW_VERSION_STEP, {
    client: apolloCoreClient,
  });

  const deleteWorkflowVersionStep = async (
    input: DeleteWorkflowVersionStepInput,
  ) => {
    const result = await mutate({
      variables: { input },
      awaitRefetchQueries: true,
      refetchQueries: [
        {
          query: findOneWorkflowVersionQuery,
          variables: { objectRecordId: input.workflowVersionId },
        },
      ],
    });

    const workflowVersionStepChanges = result?.data?.deleteWorkflowVersionStep;

    updateWorkflowVersionCache({
      workflowVersionStepChanges,
      workflowVersionId: input.workflowVersionId,
    });

    return workflowVersionStepChanges;
  };

  return { deleteWorkflowVersionStep };
};
