import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { useFindOneRecordQuery } from '@/object-record/hooks/useFindOneRecordQuery';
import { DELETE_WORKFLOW_VERSION_STEP } from '@/workflow/graphql/mutations/deleteWorkflowVersionStep';
import { useUpdateWorkflowVersionCache } from '@/workflow/workflow-steps/hooks/useUpdateWorkflowVersionCache';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useMutation } from '@apollo/client/react';
import {
  type DeleteWorkflowVersionStepInput,
  type DeleteWorkflowVersionStepMutation,
  type DeleteWorkflowVersionStepMutationVariables,
} from '~/generated/graphql';

export const useDeleteWorkflowVersionStep = () => {
  const apolloCoreClient = useApolloCoreClient();

  const { updateWorkflowVersionCache } = useUpdateWorkflowVersionCache();
  const { enqueueErrorSnackBar } = useSnackBar();

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
      onError: (error) => {
        enqueueErrorSnackBar({ apolloError: error });
      },
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
