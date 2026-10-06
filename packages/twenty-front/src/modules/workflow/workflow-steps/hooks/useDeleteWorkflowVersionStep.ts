import { useMutation } from '@apollo/client/react';

import { invalidateCoreWorkflowVersions } from '@/object-core/workflows/versions/utils/invalidateCoreWorkflowVersions';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useWorkflowEditorMutationErrorHandler } from '@/workflow/hooks/useWorkflowEditorMutationErrorHandler';
import { useApplyWorkflowVersionStepChanges } from '@/workflow/workflow-steps/hooks/useApplyWorkflowVersionStepChanges';
import {
  DeleteCoreWorkflowVersionStepDocument,
  type DeleteCoreWorkflowVersionStepInput,
} from '~/generated/graphql';

type DeleteWorkflowVersionStepInput = Omit<
  DeleteCoreWorkflowVersionStepInput,
  'coreWorkflowVersionId'
> & {
  workflowVersionId: string;
};

export const useDeleteWorkflowVersionStep = () => {
  const apolloCoreClient = useApolloCoreClient();
  const handleMutationError = useWorkflowEditorMutationErrorHandler();
  const [mutate] = useMutation(DeleteCoreWorkflowVersionStepDocument, {
    client: apolloCoreClient,
    onError: handleMutationError,
  });

  const { applyWorkflowVersionStepChanges } =
    useApplyWorkflowVersionStepChanges();

  const deleteWorkflowVersionStep = async (
    input: DeleteWorkflowVersionStepInput,
  ) => {
    const { workflowVersionId, ...stepInput } = input;
    const result = await mutate({
      variables: {
        input: { ...stepInput, coreWorkflowVersionId: workflowVersionId },
      },
    });

    const workflowVersionStepChanges = result?.data?.deleteWorkflowVersionStep;

    applyWorkflowVersionStepChanges({
      workflowVersionStepChanges,
      workflowVersionId,
    });

    await invalidateCoreWorkflowVersions(apolloCoreClient);

    return workflowVersionStepChanges;
  };

  return { deleteWorkflowVersionStep };
};
